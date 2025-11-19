#!/usr/bin/env python3
"""
Create an optimized sites index from global.json
Extracts lightweight metadata for quick filtering by source
"""

import json
import sys
from pathlib import Path

def create_sites_index():
    """Create sites index from global.json"""
    
    # Read the global.json from the remote URL or local file
    try:
        import urllib.request
        url = "https://raw.githubusercontent.com/noussairlazrak/MLpred/refs/heads/main/global.json"
        print(f"Fetching global.json from: {url}")
        with urllib.request.urlopen(url) as response:
            global_data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching from URL: {e}")
        print("Using local global.json if available")
        return None
    
    sites_index = []
    
    # Parse the global.json structure
    # It appears to have location IDs as keys, with site metadata as values
    for location_id, site_data in global_data.items():
        try:
            # Extract metadata
            site_entry = {
                "location_id": location_id,
                "location_name": site_data.get("location_name", ""),
                "lat": site_data.get("lat"),
                "lon": site_data.get("lon"),
                "timezone": site_data.get("timezone", "UTC"),
                "status": site_data.get("status", "active"),
                "observation_source": site_data.get("observation_source", ""),
                "species": site_data.get("species", "no2"),
                # Parse the observation source to get file names
                "file": f"{site_data.get('location_name', 'Unknown')}.json",
                # Normalize sources - can be a string or the observation_source
                "sources": []
            }
            
            # Determine sources
            obs_source = site_data.get("observation_source", "").lower()
            if obs_source:
                # Map observation sources to source names
                source_mapping = {
                    "nasa pandora": "pandora",
                    "dos_missions": "dos_missions",
                    "dos missions": "dos_missions",
                    "dosmissions": "dos_missions",
                    "aeronet": "aeronet",
                    "geoscf": "geoscf",
                    "local": "local",
                    "merra2": "merra2",
                    "remmaq": "remmaq",
                }
                
                # Check for exact matches first
                for key, source in source_mapping.items():
                    if key in obs_source:
                        site_entry["sources"].append(source)
                        break
                
                # If no match, use the source as-is (cleaned)
                if not site_entry["sources"]:
                    cleaned_source = obs_source.replace(" ", "_").lower()
                    site_entry["sources"].append(cleaned_source)
            
            # Also check precomputed_forecasts to infer sources
            precomputed = site_data.get("precomputed_forecasts", {})
            if isinstance(precomputed, dict):
                # If it has a "file" key, it might be referencing a source
                if "file" in precomputed:
                    site_entry["file"] = precomputed.get("file", site_entry["file"])
            
            sites_index.append(site_entry)
        
        except Exception as e:
            print(f"Error processing site {location_id}: {e}", file=sys.stderr)
            continue
    
    print(f"Created index with {len(sites_index)} sites")
    
    # Save the index
    output_path = Path(__file__).parent / "precomputed" / "sites_index.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(sites_index, f, indent=2)
    
    print(f"Saved sites index to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.1f} KB")
    
    return output_path

if __name__ == "__main__":
    create_sites_index()
