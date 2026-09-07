#!/usr/bin/env python3
"""Generate and validate the app's problems.json from the curated topic document."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TOPICS_PATH = ROOT / "Apps/data/problem-topics.json"
OUTPUT_PATH = ROOT / "Apps/data/problems.json"
DATABASE_PATH = ROOT / "Apps/data/bleague.sqlite"
FORBIDDEN_SQL = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|BEGIN|COMMIT|ROLLBACK)\b",
    re.IGNORECASE,
)
SQL_START = re.compile(r"^(SELECT|WITH)\b", re.IGNORECASE)


class ValidationError(Exception):
    pass


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValidationError(f"{path}: JSONを読み込めません: {error}") from error


def expand_document(document: dict) -> dict:
    """Expand compact repetition families into concrete problem definitions."""
    if not isinstance(document, dict):
        return document
    expanded = dict(document)
    problems = list(document.get("problems", []))
    for family in document.get("problemFamilies", []):
        start_id = int(family["startId"])
        candidates = family.get("sourceTables", [])
        for offset, item in enumerate(family.get("items", [])):
            answer_sql = item.get("answerSql", item.get("referenceSql"))
            if not answer_sql:
                raise ValidationError(f"problemFamilies[{family['startId']}]: answerSqlまたはreferenceSqlがありません")
            source_tables = item.get("sourceTables")
            if source_tables is None:
                source_tables = [
                    table for table in candidates
                    if re.search(rf"\b{re.escape(table)}\b", answer_sql, re.IGNORECASE)
                ]
            problem = {
                "id": f"bball-{start_id + offset:03d}",
                "title": item["title"],
                "prompt": item["prompt"],
                "difficulty": family["difficulty"],
                "category": family["category"],
                "sourceTables": source_tables,
                "answerSql": answer_sql,
                "judgeSql": item.get("judgeSql", answer_sql),
                "resultSpec": item.get("resultSpec", family.get("resultSpec", family.get("comparison"))),
                "requiredColumns": item.get("requiredColumns"),
                "learningObjectives": item.get("learningObjectives", item.get("requiredSqlTerms", [])),
                "explanation": item.get("explanation", family["explanation"]),
            }
            problems.append(problem)
    expanded["problems"] = problems
    return expanded


def normalize_problem(problem: dict) -> dict:
    """Normalize the legacy problem shape into the explicit runtime shape."""
    normalized = dict(problem)
    answer_sql = normalized.get("answerSql", normalized.get("referenceSql"))
    if not answer_sql:
        raise ValidationError(f"{normalized.get('id', 'problem')}: answerSqlまたはreferenceSqlがありません")
    legacy_comparison = normalized.get("comparison", {})
    result_spec = dict(normalized.get("resultSpec") or {})
    result_spec.setdefault("rowOrder", legacy_comparison.get("rowOrder", "sensitive"))
    if "numericTolerance" not in result_spec and "numericTolerance" in legacy_comparison:
        result_spec["numericTolerance"] = legacy_comparison["numericTolerance"]
    result_spec.setdefault("columns", [])

    normalized["answerSql"] = answer_sql
    normalized["judgeSql"] = normalized.get("judgeSql", answer_sql)
    normalized["resultSpec"] = result_spec
    normalized["requiredColumns"] = normalized.get("requiredColumns")
    normalized["learningObjectives"] = normalized.get(
        "learningObjectives",
        normalized.get("requiredSqlTerms", []),
    )
    for legacy_key in ("referenceSql", "comparison", "requiredSqlTerms"):
        normalized.pop(legacy_key, None)
    return normalized


def strip_sql_comments(sql: str) -> str:
    sql = re.sub(r"/\*[\s\S]*?\*/", " ", sql)
    return re.sub(r"--[^\n\r]*", " ", sql)


def validate_sql(sql: str, label: str) -> str:
    cleaned = strip_sql_comments(sql).strip()
    if not SQL_START.match(cleaned):
        raise ValidationError(f"{label}: SELECTまたはWITHで始まっていません")
    without_trailing_semicolon = re.sub(r";\s*$", "", cleaned)
    if ";" in without_trailing_semicolon:
        raise ValidationError(f"{label}: 複数のSQL文は登録できません")
    if FORBIDDEN_SQL.search(without_trailing_semicolon):
        raise ValidationError(f"{label}: 更新系・DDL・管理用SQLは登録できません")
    return without_trailing_semicolon


def validate_document(document: dict) -> list[dict]:
    if not isinstance(document, dict) or not isinstance(document.get("problems"), list):
        raise ValidationError("問題主題ドキュメントのproblemsが配列ではありません")
    problems = [normalize_problem(problem) for problem in document["problems"]]
    if not problems:
        raise ValidationError("問題が1件もありません")

    ids: set[str] = set()
    duplicate_keys: set[tuple[str, str]] = set()
    for index, problem in enumerate(problems, start=1):
        label = f"problems[{index}]"
        required = ["id", "title", "prompt", "difficulty", "category", "sourceTables", "answerSql", "judgeSql", "resultSpec", "explanation"]
        missing = [key for key in required if key not in problem]
        if missing:
            raise ValidationError(f"{label}: 必須項目がありません: {', '.join(missing)}")
        problem_id = problem["id"]
        if not isinstance(problem_id, str) or not problem_id:
            raise ValidationError(f"{label}: idが不正です")
        if problem_id in ids:
            raise ValidationError(f"{label}: idが重複しています: {problem_id}")
        ids.add(problem_id)
        difficulty = problem["difficulty"]
        if not isinstance(difficulty, int) or not 1 <= difficulty <= 5:
            raise ValidationError(f"{label}: difficultyは1〜5の整数にしてください")
        if not isinstance(problem["sourceTables"], list) or not problem["sourceTables"]:
            raise ValidationError(f"{label}: sourceTablesが空です")
        if any(not isinstance(table, str) or not table for table in problem["sourceTables"]):
            raise ValidationError(f"{label}: sourceTablesに不正な値があります")
        result_spec = problem["resultSpec"]
        if not isinstance(result_spec, dict):
            raise ValidationError(f"{label}: resultSpecがオブジェクトではありません")
        if result_spec.get("rowOrder") not in {"sensitive", "insensitive"}:
            raise ValidationError(f"{label}: resultSpec.rowOrderが不正です")
        columns = result_spec.get("columns")
        if not isinstance(columns, list) or any(not isinstance(column, str) or not column for column in columns):
            raise ValidationError(f"{label}: resultSpec.columnsが不正です")
        numeric_tolerance = result_spec.get("numericTolerance", 0)
        if not isinstance(numeric_tolerance, (int, float)) or numeric_tolerance < 0:
            raise ValidationError(f"{label}: resultSpec.numericToleranceが不正です")
        required_columns = problem.get("requiredColumns")
        if required_columns is not None:
            if not isinstance(required_columns, list) or any(
                not isinstance(column, dict)
                or not isinstance(column.get("label"), str)
                or not column["label"]
                or column.get("type") not in {None, "source", "derived"}
                or (column.get("type") != "derived" and (
                    not isinstance(column.get("reference"), str)
                    or not column["reference"]
                ))
                for column in required_columns
            ):
                raise ValidationError(f"{label}: requiredColumnsが不正です")
            if any(
                column.get("type") != "derived" and "." in column["reference"]
                for column in required_columns
            ):
                raise ValidationError(f"{label}: requiredColumns.referenceはテーブル名だけを指定してください")
        answer_sql = validate_sql(problem["answerSql"], label)
        judge_sql = validate_sql(problem["judgeSql"], label)
        key = (re.sub(r"\s+", " ", problem["title"]).strip(), answer_sql)
        if key in duplicate_keys:
            raise ValidationError(f"{label}: タイトルと参考SQLが重複しています")
        duplicate_keys.add(key)
        for term in problem.get("learningObjectives", []):
            if not isinstance(term, str) or not term:
                raise ValidationError(f"{label}: learningObjectivesに不正な値があります")
        problem["answerSql"] = answer_sql
        problem["judgeSql"] = judge_sql
    return problems


def sqlite_table_names(connection: sqlite3.Connection) -> set[str]:
    rows = connection.execute(
        "SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'"
    )
    return {str(row[0]).lower() for row in rows}


SQL_ALIAS_KEYWORDS = {
    "AS", "ON", "WHERE", "GROUP", "ORDER", "LIMIT", "HAVING", "JOIN", "LEFT",
    "RIGHT", "INNER", "OUTER", "CROSS", "FULL", "UNION", "EXCEPT", "INTERSECT",
}


def table_aliases(sql: str, source_tables: list[str]) -> dict[str, str]:
    """Return SQL aliases that resolve to one of the declared source tables."""
    declared = {table.lower(): table for table in source_tables}
    aliases: dict[str, str] = {}
    pattern = re.compile(
        r"\b(?:FROM|JOIN)\s+([A-Za-z_][A-Za-z0-9_]*)"
        r"(?:\s+(?:AS\s+)?([A-Za-z_][A-Za-z0-9_]*))?",
        re.IGNORECASE,
    )
    for match in pattern.finditer(sql):
        table_name = match.group(1)
        canonical_table = declared.get(table_name.lower())
        if canonical_table is None:
            continue
        aliases[table_name.lower()] = canonical_table
        alias = match.group(2)
        if alias and alias.upper() not in SQL_ALIAS_KEYWORDS:
            aliases[alias.lower()] = canonical_table
    return aliases


def sqlite_columns(connection: sqlite3.Connection, table_name: str) -> set[str]:
    escaped_name = table_name.replace('"', '""')
    rows = connection.execute(f'PRAGMA table_info("{escaped_name}")').fetchall()
    return {str(row[1]).lower() for row in rows}


def infer_required_column_table(
    connection: sqlite3.Connection,
    sql: str,
    column: str,
    source_tables: list[str],
) -> str:
    """Infer the base table to show beside a result column in the UI."""
    aliases = table_aliases(sql, source_tables)
    qualified_pattern = re.compile(
        rf"\b([A-Za-z_][A-Za-z0-9_]*)\.{re.escape(column)}\b",
        re.IGNORECASE,
    )
    qualified_candidates = {
        aliases[match.group(1).lower()]
        for match in qualified_pattern.finditer(sql)
        if match.group(1).lower() in aliases
    }
    if len(qualified_candidates) == 1:
        return next(iter(qualified_candidates))

    column_lower = column.lower()
    schema_candidates = [
        table for table in source_tables
        if column_lower in sqlite_columns(connection, table)
    ]
    if len(schema_candidates) == 1:
        return schema_candidates[0]
    if source_tables:
        return source_tables[0]
    return "unknown"


def is_physical_column(
    connection: sqlite3.Connection,
    column: str,
    source_tables: list[str],
) -> bool:
    """Return whether a result label is a column physically present in a source table."""
    column_lower = column.lower()
    return any(
        column_lower in sqlite_columns(connection, table)
        for table in source_tables
    )


def normalize_required_columns(
    connection: sqlite3.Connection,
    sql: str,
    columns: list[dict],
    source_tables: list[str],
) -> list[dict]:
    """Add the display kind while keeping derived columns free of source-table tags."""
    normalized = []
    for column in columns:
        label = column["label"]
        if is_physical_column(connection, label, source_tables):
            normalized.append({
                "label": label,
                "type": "source",
                "reference": column.get("reference") or infer_required_column_table(
                    connection,
                    sql,
                    label,
                    source_tables,
                ),
            })
        else:
            normalized.append({
                "label": label,
                "type": "derived",
            })
    return normalized


def values_match(actual, expected, numeric_tolerance: float) -> bool:
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return abs(actual - expected) <= numeric_tolerance
    return actual == expected


def rows_match(actual, expected, numeric_tolerance: float) -> bool:
    return len(actual) == len(expected) and all(
        values_match(actual_value, expected_value, numeric_tolerance)
        for actual_value, expected_value in zip(actual, expected)
    )


def result_values_match(actual_rows, expected_rows, result_spec: dict) -> bool:
    if len(actual_rows) != len(expected_rows):
        return False
    numeric_tolerance = result_spec.get("numericTolerance", 0)
    if result_spec.get("rowOrder") == "sensitive":
        return all(
            rows_match(actual_row, expected_row, numeric_tolerance)
            for actual_row, expected_row in zip(actual_rows, expected_rows)
        )
    unmatched = list(expected_rows)
    for actual_row in actual_rows:
        match_index = next(
            (index for index, expected_row in enumerate(unmatched)
             if rows_match(actual_row, expected_row, numeric_tolerance)),
            None,
        )
        if match_index is None:
            return False
        unmatched.pop(match_index)
    return not unmatched


def validate_against_database(problems: list[dict], database_path: Path) -> None:
    if not database_path.exists():
        raise ValidationError(f"SQLiteがありません: {database_path}")
    connection = sqlite3.connect(database_path)
    try:
        available_tables = sqlite_table_names(connection)
        for index, problem in enumerate(problems, start=1):
            label = f"{problem['id']} (problems[{index}])"
            missing_tables = [table for table in problem["sourceTables"] if table.lower() not in available_tables]
            if missing_tables:
                raise ValidationError(f"{label}: 存在しないテーブルです: {', '.join(missing_tables)}")
            answer_sql = validate_sql(problem["answerSql"], label)
            judge_sql = validate_sql(problem["judgeSql"], label)
            try:
                connection.execute(f"EXPLAIN QUERY PLAN {judge_sql}").fetchall()
                judge_cursor = connection.execute(judge_sql)
                rows = judge_cursor.fetchall()
                judge_columns = [description[0] for description in judge_cursor.description or []]
                connection.execute(f"EXPLAIN QUERY PLAN {answer_sql}").fetchall()
                answer_cursor = connection.execute(answer_sql)
                answer_rows = answer_cursor.fetchall()
                answer_columns = [description[0] for description in answer_cursor.description or []]
            except sqlite3.Error as error:
                raise ValidationError(f"{label}: answerSql/judgeSqlを実行できません: {error}") from error
            if not rows:
                raise ValidationError(f"{label}: judgeSqlが空結果です")
            if not answer_rows:
                raise ValidationError(f"{label}: answerSqlが空結果です")
            expected_columns = problem["resultSpec"]["columns"]
            if not expected_columns:
                problem["resultSpec"]["columns"] = judge_columns
                expected_columns = judge_columns
            if not problem.get("requiredColumns"):
                problem["requiredColumns"] = [
                    {
                        "label": column,
                        "reference": infer_required_column_table(
                            connection,
                            judge_sql,
                            column,
                            problem["sourceTables"],
                        ),
                    }
                    for column in expected_columns
                ]
            problem["requiredColumns"] = normalize_required_columns(
                connection,
                judge_sql,
                problem["requiredColumns"],
                problem["sourceTables"],
            )
            if any(
                column["type"] == "source" and (
                    " in " in column["reference"].lower()
                    or "." in column["reference"]
                    or column["reference"] not in problem["sourceTables"]
                )
                for column in problem["requiredColumns"]
            ):
                raise ValidationError(
                    f"{label}: requiredColumns.referenceはsourceTables内のテーブル名だけを指定してください"
                )
            if judge_columns != expected_columns:
                raise ValidationError(
                    f"{label}: resultSpec.columnsとjudgeSqlの出力列が一致しません: "
                    f"expected={expected_columns}, actual={judge_columns}"
                )
            if len(answer_columns) != len(expected_columns):
                raise ValidationError(
                    f"{label}: answerSqlの出力列数がresultSpecと一致しません: "
                    f"expected={len(expected_columns)}, actual={len(answer_columns)}"
                )
            if not result_values_match(answer_rows, rows, problem["resultSpec"]):
                raise ValidationError(f"{label}: answerSqlとjudgeSqlの結果が一致しません")
            normalized_sql = judge_sql.lower()
            for table in problem["sourceTables"]:
                if re.search(rf"\b{re.escape(table.lower())}\b", normalized_sql) is None:
                    raise ValidationError(f"{label}: sourceTablesの{table}がjudgeSqlに登場しません")
    finally:
        connection.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="検証後にproblems.jsonを書き出す")
    parser.add_argument("--topics", type=Path, default=TOPICS_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--database", type=Path, default=DATABASE_PATH)
    args = parser.parse_args()

    try:
        document = expand_document(load_json(args.topics))
        problems = validate_document(document)
        validate_against_database(problems, args.database)
        generated = json.dumps(problems, ensure_ascii=False, indent=2) + "\n"
        if args.write:
            args.output.write_text(generated, encoding="utf-8")
            print(f"generated {args.output} ({len(problems)} problems)")
        elif args.output.exists() and args.output.read_text(encoding="utf-8") != generated:
            raise ValidationError(f"{args.output}が主題ドキュメントから生成した内容と一致しません。--writeで更新してください")
        print(f"validated {len(problems)} problems against {args.database}")
        return 0
    except ValidationError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
