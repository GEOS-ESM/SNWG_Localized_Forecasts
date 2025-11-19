#!/usr/bin/env python3
"""
Creates a lightweight index of all available sites from the all_dts folder.
This index is used for fast filtering without loading the heavy combined_forecasts.json.gz
"""

import json
import os
from pathlib import Path

def create_site_index():
    """Generate an index of all sites from individual JSON files"""
    
    dts_folder = Path("precomputed/all_dts")
    if not dts_folder.exists():
        print(f"Error: {dts_folder} not found")
        return
    
    sites_index = []
    
    for json_file in sorted(dts_folder.glob("*.json")):
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Extract relevant metadata
            site_entry = {
                "location": data.get("location", json_file.stem),
                "location_name": data.get("location_name", data.get("location", json_file.stem)),
                "lat": data.get("latitude", data.get("lat")),
                "lon": data.get("longitude", data.get("lon")),
                "timezone": data.get("timezone", "UTC"),
                "sources": data.get("sources", []),
                "species": data.get("species", "no2"),
                "file": json_file.name  # Store the filename for lazy loading
            }
            
            # Only add if we have coordinates
            if site_entry["lat"] is not None and site_entry["lon"] is not None:
                sites_index.append(site_entry)
                
        except Exception as e:
            print(f"Warning: Error reading {json_file.name}: {e}")
    
    # Save index
    output_file = Path("precomputed/sites_index.json")
    with open(output_file, 'w') as f:
        json.dump(sites_index, f, indent=2)
    
    print(f"✓ Created sites index with {len(sites_index)} sites")
    print(f"✓ Saved to {output_file}")
    print(f"✓ Index size: {output_file.stat().st_size / 1024:.1f} KB")

if __name__ == "__main__":
    create_site_index()
