#!/usr/bin/env python3
"""Import the eight base-table CSV exports into the browser-facing SQLite file."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sqlite3
import sys
from pathlib import Path


BASE_TABLES = (
    "game_team_stats",
    "games",
    "player_affiliations",
    "player_game_stats",
    "player_name_history",
    "players",
    "team_name_history",
    "teams",
)

# The live players export contains this column, while the checked-in Markdown
# snapshot predates it. Keep the export usable without silently dropping data.
EXTRA_COLUMNS = {
    "players": [("entity_type", "TEXT")],
}

POSTGRES_TO_SQLITE = {
    "bigint": "INTEGER",
    "integer": "INTEGER",
    "smallint": "INTEGER",
    "numeric": "REAL",
    "boolean": "INTEGER",
    "text": "TEXT",
    "timestamp with time zone": "TEXT",
}


def quote_identifier(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def parse_schema(path: Path) -> dict[str, list[tuple[str, str]]]:
    """Read the table/column types from the checked-in Markdown schema snapshot."""
    schema: dict[str, list[tuple[str, str]]] = {}
    current_table: str | None = None
    row_pattern = re.compile(r"^\|\s*`([^`]+)`\s*\|.*?\|\s*`([^`]+)`\s*\|")

    for line in path.read_text(encoding="utf-8").splitlines():
        heading = re.match(r"^##\s+([^\s].*)$", line)
        if heading:
            current_table = heading.group(1).strip()
            if current_table in BASE_TABLES:
                schema[current_table] = []
            continue
        if current_table not in BASE_TABLES:
            continue
        match = row_pattern.match(line)
        if not match:
            continue
        column, postgres_type = match.groups()
        sqlite_type = POSTGRES_TO_SQLITE.get(postgres_type)
        if sqlite_type is None:
            raise ValueError(f"Unsupported type in schema: {current_table}.{column}: {postgres_type}")
        schema[current_table].append((column, sqlite_type))

    missing = [table for table in BASE_TABLES if not schema.get(table)]
    if missing:
        raise ValueError(f"Schema definition is missing tables: {', '.join(missing)}")
    for table, columns in EXTRA_COLUMNS.items():
        schema[table].extend(column for column in columns if column[0] not in {name for name, _ in schema[table]})
    return schema


def convert_value(raw: str | None, sqlite_type: str, table: str, column: str, row_number: int):
    if raw is None or raw == "" or raw.strip().lower() in {"null", "none"}:
        return None
    if sqlite_type == "INTEGER":
        lowered = raw.strip().lower()
        if lowered in {"true", "t"}:
            return 1
        if lowered in {"false", "f"}:
            return 0
        try:
            return int(raw)
        except ValueError as exc:
            raise ValueError(f"{table}.csv row {row_number}: {column} must be an integer: {raw!r}") from exc
    if sqlite_type == "REAL":
        try:
            return float(raw)
        except ValueError as exc:
            raise ValueError(f"{table}.csv row {row_number}: {column} must be numeric: {raw!r}") from exc
    return raw


def import_table(connection: sqlite3.Connection, csv_path: Path, table: str, columns: list[tuple[str, str]]) -> int:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = [header.strip() if header else "" for header in (reader.fieldnames or [])]
        expected_headers = [column for column, _ in columns]
        missing = [column for column in expected_headers if column not in headers]
        extra = [column for column in headers if column not in expected_headers]
        if missing or extra:
            details = []
            if missing:
                details.append(f"missing: {', '.join(missing)}")
            if extra:
                details.append(f"unexpected: {', '.join(extra)}")
            raise ValueError(f"{csv_path}: " + "; ".join(details))

        quoted_columns = ", ".join(
            f"{quote_identifier(column)} {sqlite_type}" for column, sqlite_type in columns
        )
        connection.execute(f"DROP TABLE IF EXISTS {quote_identifier(table)}")
        connection.execute(f"CREATE TABLE {quote_identifier(table)} ({quoted_columns})")
        insert_columns = ", ".join(quote_identifier(column) for column, _ in columns)
        placeholders = ", ".join("?" for _ in columns)
        insert_sql = f"INSERT INTO {quote_identifier(table)} ({insert_columns}) VALUES ({placeholders})"
        count = 0
        for count, row in enumerate(reader, start=1):
            values = [
                convert_value(row.get(column), sqlite_type, table, column, count)
                for column, sqlite_type in columns
            ]
            connection.execute(insert_sql, values)
        return count


def build_database(input_dir: Path, schema_path: Path, output_path: Path) -> None:
    schema = parse_schema(schema_path)
    csv_paths: dict[str, Path] = {}
    for table in BASE_TABLES:
        candidates = [input_dir / f"{table}.csv", input_dir / f"Supabase_{table}.csv"]
        present = [path for path in candidates if path.is_file()]
        if len(present) > 1:
            raise FileExistsError(f"Multiple CSV files found for {table}: {', '.join(str(p) for p in present)}")
        if present:
            csv_paths[table] = present[0]
    missing_files = [table for table in BASE_TABLES if table not in csv_paths]
    if missing_files:
        raise FileNotFoundError(
            "CSV files are missing: " + ", ".join(f"{table}.csv" for table in missing_files)
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = output_path.with_suffix(output_path.suffix + ".tmp")
    if temporary_path.exists():
        temporary_path.unlink()
    try:
        connection = sqlite3.connect(temporary_path)
        with connection:
            for table in BASE_TABLES:
                count = import_table(connection, csv_paths[table], table, schema[table])
                print(f"{table}: {count} rows ({csv_paths[table].name})")
            connection.execute("PRAGMA foreign_keys = OFF")
            connection.execute("PRAGMA journal_mode = DELETE")
        connection.close()
        temporary_path.replace(output_path)
        manifest_path = output_path.parent / "db-manifest.json"
        manifest_path.write_text(
            json.dumps({"available": True, "path": output_path.name}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    except Exception:
        if temporary_path.exists():
            temporary_path.unlink()
        raise


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=root / "Apps/data/csv")
    parser.add_argument("--schema", type=Path, default=root / "Apps/table_definition.md")
    parser.add_argument("--output", type=Path, default=root / "Apps/data/bleague.sqlite")
    args = parser.parse_args()
    try:
        build_database(args.input_dir, args.schema, args.output)
    except (FileNotFoundError, ValueError, OSError) as error:
        print(f"import failed: {error}", file=sys.stderr)
        return 1
    print(f"created: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
