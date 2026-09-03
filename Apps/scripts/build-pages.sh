#!/usr/bin/env bash
set -euo pipefail

app_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
public_dir="$app_root/public"

rm -rf "$public_dir"
mkdir -p "$public_dir/data"

for asset in index.html app.js styles.css; do
  cp "$app_root/app/$asset" "$public_dir/$asset"
done
cp "$app_root/_headers" "$public_dir/_headers"
cp "$app_root/data/problems.json" "$public_dir/data/problems.json"

if [[ -f "$app_root/data/bleague.sqlite" ]]; then
  cp "$app_root/data/bleague.sqlite" "$public_dir/data/bleague.sqlite"
  printf '%s\n' '{"available": true, "path": "bleague.sqlite"}' > "$public_dir/data/db-manifest.json"
else
  python3 "$app_root/scripts/import_csv_to_sqlite.py" \
    --input-dir "$app_root/data/csv" \
    --schema "$app_root/table_definition.md" \
    --output "$public_dir/data/bleague.sqlite"
fi

printf 'Prepared Cloudflare Pages artifact: %s\n' "$public_dir"
