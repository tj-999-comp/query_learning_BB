#!/usr/bin/env python3
"""Validate the source-side work-record contract without third-party packages."""

from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK_RECORDS = ROOT / "work-records"
MARKDOWN = WORK_RECORDS / "md"
METADATA = WORK_RECORDS / "metadata"
NAME_RE = re.compile(r"^work_record_(\d{3})$")
HEADING_RE = re.compile(r"^# 作業記録 (\d{3}): .+$")
DATE_RE = re.compile(r"^作成日:\s*(\d{4}-\d{2}-\d{2})\s*$")
REQUIRED_METADATA = ("schema_version", "title", "date", "project_id", "tags", "publish")


def scalar_keys(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#") or line.startswith((" ", "-")):
            continue
        key, separator, value = line.partition(":")
        if separator and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key.strip()):
            values[key.strip()] = value.strip().strip("'\"")
    return values


def main() -> int:
    errors: list[str] = []
    if not MARKDOWN.is_dir() or not METADATA.is_dir():
        print("work-records/md/ and work-records/metadata/ are required", file=sys.stderr)
        return 1

    md_paths = sorted(MARKDOWN.glob("*.md"))
    metadata_paths = sorted(METADATA.glob("*.yml"))
    md_names: set[str] = set()
    metadata_names: set[str] = set()

    for path in md_paths:
        match = NAME_RE.fullmatch(path.stem)
        if not match:
            errors.append(f"{path}: expected work_record_###.md")
            continue
        number = match.group(1)
        md_names.add(path.stem)
        lines = path.read_text(encoding="utf-8").splitlines()
        heading = HEADING_RE.fullmatch(lines[0]) if lines else None
        if not heading or heading.group(1) != number:
            errors.append(f"{path}: first line must be '# 作業記録 {number}: <内容>'")
        date_matches = [DATE_RE.fullmatch(line.strip()) for line in lines[1:]]
        if not any(date_matches):
            errors.append(f"{path}: 作成日: YYYY-MM-DD is required")
        else:
            try:
                date.fromisoformat(next(match.group(1) for match in date_matches if match))
            except ValueError:
                errors.append(f"{path}: invalid 作成日")

    for path in metadata_paths:
        if not NAME_RE.fullmatch(path.stem):
            errors.append(f"{path}: expected work_record_###.yml")
            continue
        metadata_names.add(path.stem)
        values = scalar_keys(path)
        missing = [key for key in REQUIRED_METADATA if key not in values]
        if missing:
            errors.append(f"{path}: missing metadata keys: {', '.join(missing)}")
        if values.get("schema_version") != "1":
            errors.append(f"{path}: schema_version must be 1")
        project_id = values.get("project_id", "")
        if project_id and not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", project_id):
            errors.append(f"{path}: project_id contains unsupported characters")

    for name in sorted(md_names - metadata_names):
        errors.append(f"{name}: metadata file is missing")
    for name in sorted(metadata_names - md_names):
        errors.append(f"{name}: Markdown file is missing")

    if errors:
        print("Validation failed:", file=sys.stderr)
        print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
        return 1
    print(f"Validated {len(md_names)} work record(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
