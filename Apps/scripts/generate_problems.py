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
            reference_sql = item["referenceSql"]
            source_tables = item.get("sourceTables")
            if source_tables is None:
                source_tables = [
                    table for table in candidates
                    if re.search(rf"\b{re.escape(table)}\b", reference_sql, re.IGNORECASE)
                ]
            problem = {
                "id": f"bball-{start_id + offset:03d}",
                "title": item["title"],
                "prompt": item["prompt"],
                "difficulty": family["difficulty"],
                "category": family["category"],
                "sourceTables": source_tables,
                "referenceSql": reference_sql,
                "comparison": family["comparison"],
                "requiredSqlTerms": item.get("requiredSqlTerms", []),
                "explanation": item.get("explanation", family["explanation"]),
            }
            problems.append(problem)
    expanded["problems"] = problems
    return expanded


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
    problems = document["problems"]
    if not problems:
        raise ValidationError("問題が1件もありません")

    ids: set[str] = set()
    duplicate_keys: set[tuple[str, str]] = set()
    for index, problem in enumerate(problems, start=1):
        label = f"problems[{index}]"
        required = ["id", "title", "prompt", "difficulty", "category", "sourceTables", "referenceSql", "comparison", "explanation"]
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
        comparison = problem["comparison"]
        if comparison.get("rowOrder") not in {"sensitive", "insensitive"}:
            raise ValidationError(f"{label}: comparison.rowOrderが不正です")
        key = (re.sub(r"\s+", " ", problem["title"]).strip(), validate_sql(problem["referenceSql"], label))
        if key in duplicate_keys:
            raise ValidationError(f"{label}: タイトルと参考SQLが重複しています")
        duplicate_keys.add(key)
        for term in problem.get("requiredSqlTerms", []):
            if term.lower() not in problem["referenceSql"].lower():
                raise ValidationError(f"{label}: referenceSqlに必要語句がありません: {term}")
    return problems


def sqlite_table_names(connection: sqlite3.Connection) -> set[str]:
    rows = connection.execute(
        "SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'"
    )
    return {str(row[0]).lower() for row in rows}


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
            reference_sql = validate_sql(problem["referenceSql"], label)
            try:
                connection.execute(f"EXPLAIN QUERY PLAN {reference_sql}").fetchall()
                rows = connection.execute(reference_sql).fetchall()
            except sqlite3.Error as error:
                raise ValidationError(f"{label}: 参考SQLを実行できません: {error}") from error
            if not rows:
                raise ValidationError(f"{label}: 参考SQLが空結果です")
            normalized_sql = reference_sql.lower()
            for table in problem["sourceTables"]:
                if re.search(rf"\b{re.escape(table.lower())}\b", normalized_sql) is None:
                    raise ValidationError(f"{label}: sourceTablesの{table}が参考SQLに登場しません")
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
