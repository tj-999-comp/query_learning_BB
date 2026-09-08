#!/usr/bin/env python3
"""List numbered work-record basenames changed between two commits."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TARGET_PATH_RE = re.compile(
    r"^work-records/(?:md/|metadata/)(work_record_[0-9]{3})\.(?:md|yml)$"
)


def is_publishable(target: str) -> bool:
    try:
        lines = (ROOT / "work-records" / "metadata" / f"{target}.yml").read_text(
            encoding="utf-8"
        ).splitlines()
    except OSError:
        return False
    return any(line.strip() == "publish: true" for line in lines)


def changed_targets(before: str, after: str, *, publish_only: bool = False) -> list[str]:
    if set(before) == {"0"}:
        return []
    result = subprocess.run(
        [
            "git",
            "diff",
            "--name-only",
            "--diff-filter=ACMRTUXB",
            before,
            after,
            "--",
            "work-records",
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    targets = sorted(
        {
            match.group(1)
            for path in result.stdout.splitlines()
            if (match := TARGET_PATH_RE.fullmatch(path))
        }
    )
    if not publish_only:
        return targets
    return [target for target in targets if is_publishable(target)]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--before", required=True)
    parser.add_argument("--after", required=True)
    parser.add_argument("--publish-only", action="store_true")
    args = parser.parse_args()
    print(json.dumps(changed_targets(args.before, args.after, publish_only=args.publish_only)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
