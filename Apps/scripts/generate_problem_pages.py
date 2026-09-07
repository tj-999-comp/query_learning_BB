#!/usr/bin/env python3
"""Generate the home and problem pages for the static Cloudflare Pages build."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path


PROBLEM_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
HTML_OPEN_PATTERN = re.compile(r"<html\b[^>]*>", re.IGNORECASE)


def page_html(template: str, *, page: str, app_root: str, data_root: str, problem_id: str) -> str:
    problem_pages = "true"
    document_open = (
        '<html lang="ja" '
        f'data-page="{html.escape(page, quote=True)}" '
        f'data-app-root="{html.escape(app_root, quote=True)}" '
        f'data-data-root="{html.escape(data_root, quote=True)}" '
        f'data-problem-pages="{problem_pages}" '
        f'data-problem-id="{html.escape(problem_id, quote=True)}">'
    )
    rendered = HTML_OPEN_PATTERN.sub(document_open, template, count=1)
    if page == "problem":
        rendered = rendered.replace('href="./styles.css"', f'href="{app_root}styles.css"', 1)
        rendered = rendered.replace('src="./app.js"', f'src="{app_root}app.js"', 1)
        rendered = rendered.replace('href="./"', f'href="{app_root}"', 1)
    return rendered


def load_problems(path: Path) -> list[dict[str, object]]:
    problems = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(problems, list):
        raise ValueError("問題定義は配列でなければなりません。")

    ids: set[str] = set()
    for problem in problems:
        if not isinstance(problem, dict):
            raise ValueError("問題定義の各要素はオブジェクトでなければなりません。")
        problem_id = problem.get("id")
        if not isinstance(problem_id, str) or not PROBLEM_ID_PATTERN.fullmatch(problem_id):
            raise ValueError(f"問題IDがURL形式に適合しません: {problem_id!r}")
        if problem_id in ids:
            raise ValueError(f"問題IDが重複しています: {problem_id}")
        ids.add(problem_id)
    return problems


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--problems", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    template = args.template.read_text(encoding="utf-8")
    problems = load_problems(args.problems)

    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "problems").mkdir(exist_ok=True)

    home = page_html(template, page="home", app_root="./", data_root="./data", problem_id="")
    (args.output / "index.html").write_text(home, encoding="utf-8")

    for problem in problems:
        problem_id = str(problem["id"])
        problem_dir = args.output / "problems" / problem_id
        problem_dir.mkdir(parents=True, exist_ok=True)
        rendered = page_html(
            template,
            page="problem",
            app_root="../../",
            data_root="../../data",
            problem_id=problem_id,
        )
        (problem_dir / "index.html").write_text(rendered, encoding="utf-8")

    print(f"Generated home page and {len(problems)} problem pages in {args.output}")


if __name__ == "__main__":
    main()
