#!/usr/bin/env python3
"""Validate one explicitly requested work-record publication."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


SHA_RE = re.compile(r"^[0-9a-fA-F]{40}$")
TARGET_RE = re.compile(r"^work_record_([0-9]{3})$")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--source-commit-sha", required=True)
    parser.add_argument("--target-basename", required=True)
    args = parser.parse_args()
    if not SHA_RE.fullmatch(args.source_commit_sha):
        print("source_commit_sha must be a 40-character commit SHA", file=sys.stderr)
        return 1
    match = TARGET_RE.fullmatch(args.target_basename)
    if not match or not 1 <= int(match.group(1)) <= 999:
        print("target_basename must match work_record_001 through work_record_999", file=sys.stderr)
        return 1
    root = Path(__file__).resolve().parents[2]
    markdown = root / "work-records" / "md" / f"{args.target_basename}.md"
    metadata = root / "work-records" / "metadata" / f"{args.target_basename}.yml"
    if not markdown.is_file() or not metadata.is_file():
        print("selected Markdown and metadata files are required", file=sys.stderr)
        return 1
    values = {}
    for line in metadata.read_text(encoding="utf-8").splitlines():
        if line[:1].isspace() or not line.strip() or line.lstrip().startswith("#"):
            continue
        key, separator, value = line.partition(":")
        if separator:
            values[key.strip()] = value.strip().strip("'\"")
    if values.get("project_id") != args.project_id:
        print("metadata project_id does not match the requested project", file=sys.stderr)
        return 1
    if values.get("publish") != "true":
        print("target metadata must have publish: true", file=sys.stderr)
        return 1
    print(f"validated publication request: {args.target_basename}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
