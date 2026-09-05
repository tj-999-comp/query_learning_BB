#!/usr/bin/env bash
set -euo pipefail

app_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
public_dir="$app_root/public"

rm -rf "$public_dir"
mkdir -p "$public_dir/data"

for asset in index.html app.js styles.css; do
  cp "$app_root/app/$asset" "$public_dir/$asset"
done
for asset in design-review.html design-review.css; do
  cp "$app_root/app/$asset" "$public_dir/$asset"
done
cp "$app_root/_headers" "$public_dir/_headers"
cp "$app_root/data/problems.json" "$public_dir/data/problems.json"

if [[ -f "$app_root/data/bleague.sqlite" ]]; then
  cp "$app_root/data/bleague.sqlite" "$public_dir/data/bleague.sqlite"
else
  python3 "$app_root/scripts/import_csv_to_sqlite.py" \
    --input-dir "$app_root/data/csv" \
    --schema "$app_root/table_definition.md" \
    --output "$public_dir/data/bleague.sqlite"
fi

sqlite_path="$public_dir/data/bleague.sqlite"
sqlite_size="$(python3 -c 'import os, sys; print(os.path.getsize(sys.argv[1]))' "$sqlite_path")"
max_asset_bytes=$((25 * 1024 * 1024))
chunk_bytes=$((20 * 1024 * 1024))

if (( sqlite_size > max_asset_bytes )); then
  split -b "$chunk_bytes" "$sqlite_path" "$public_dir/data/bleague.sqlite.part-"
  rm "$sqlite_path"
  manifest='{"available": true, "files": ['
  first_file=true
  for chunk_path in "$public_dir"/data/bleague.sqlite.part-*; do
    chunk_name="${chunk_path##*/}"
    if [[ "$first_file" == true ]]; then
      first_file=false
    else
      manifest+=', '
    fi
    manifest+="\"$chunk_name\""
  done
  manifest+=']}'
  printf '%s\n' "$manifest" > "$public_dir/data/db-manifest.json"
  printf 'SQLite split into Pages-safe chunks (%s bytes): %s\n' "$chunk_bytes" "$manifest"
else
  printf '%s\n' '{"available": true, "path": "bleague.sqlite"}' > "$public_dir/data/db-manifest.json"
fi

printf 'Prepared Cloudflare Pages artifact: %s\n' "$public_dir"
