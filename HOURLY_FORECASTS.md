# Pre-Computed Hourly Forecasts

This system uses pre-computed hourly forecast snapshots to dramatically reduce resource usage and network requests on GitHub Pages.

## How It Works

### 1. **Hourly Snapshot Generation**
The `generate_hourly_forecasts.py` script generates forecast files for:
- **Current day**: All 24 hours
- **Next 3 days**: 72 hours
- **Total**: 96 hourly files (~4.7MB total)

```bash
python3 sync/generate_hourly_forecasts.py
```

**Output:** `precomputed/hourly_forecasts/YYYY-MM-DD_HH.json`

Examples:
- `precomputed/hourly_forecasts/2025-11-19_14.json` (2:00 PM)
- `precomputed/hourly_forecasts/2025-11-20_08.json` (8:00 AM next day)
- `precomputed/hourly_forecasts/2025-11-23_11.json` (3 days ahead)

### 2. **File Structure**
- **Full forecast files:** `precomputed/all_dts/*.json` (8-50MB each, all historical data)
- **Hourly snapshots:** `precomputed/hourly_forecasts/YYYY-MM-DD_HH.json` (30-100KB, single hour)
- **Total snapshot coverage:** 4.7MB for 96 hours

### 3. **Loading Strategy**

The application uses smart multi-tier loading:

```
Try loading current hour snapshot (30-100KB)
  ↓ Success: Display instantly
  ↓ Used for map and current conditions
  
For future hours (forecasts):
  ↓ User can view forecasts for up to 3 days ahead
  ↓ Each hour loads from pre-computed file
  
Fallback:
  ↓ Load individual files if snapshots unavailable
  ↓ Conservative 2 concurrent requests to avoid rate limits
```

### 4. **Performance Benefits**

| Metric | Before | After |
|--------|--------|-------|
| Initial load | 100-500 requests | 1 request |
| Data size | 50-100MB | 30-100KB |
| Decompression | Demanding | None |
| Rate limits | Yes (GitHub Pages) | No |
| Display speed | Minutes | Seconds |
| Forecast range | Current hour | Up to 72 hours ahead |

## Setup

### Automatic Generation (GitHub Actions)
Add to `.github/workflows/update-forecasts.yml`:

```yaml
name: Update Hourly Forecasts

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: python3 sync/generate_hourly_forecasts.py
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'Update hourly forecasts [skip ci]'
          file_pattern: 'precomputed/hourly_forecasts/*.json'
```

### Manual Generation
```bash
cd /path/to/SNWG_Localized_Forecasts
python3 sync/generate_hourly_forecasts.py
```

### Automatic Cleanup
- Old snapshots older than 96 hours are automatically deleted
- Keeps only last 4 days of forecasts
- Saves storage space on GitHub

## File Format

**Hourly snapshot JSON:**
```json
{
  "generated_at": "2025-11-19T14:48:55.955216",
  "forecast_hour": "2025-11-19T14:00:00+00:00",
  "sites": [
    {
      "location_name": "Rabat",
      "timezone": "Africa/Casablanca",
      "species": "pm25",
      "observation_source": "DoS_Missions",
      "local_time": "2025-11-19 14:00:00",
      "no2": 1.5,
      "no2_aqi": 1.0,
      "o3": 35.2,
      "o3_aqi": 39.0,
      "pm25": 13.05,
      "pm25_aqi": null,
      "t10m": 288.15,
      "rh": 0.65,
      "wind_speed": 3.2
    },
    ...
  ]
}
```

## Usage in Application

### Current Hour Display
The app loads the current hour snapshot:
```javascript
// Try loading current hour
const snapshotPath = `precomputed/hourly_forecasts/${date}_${hour}.json`;
```

### Future Forecasts (3-day ahead)
Users can view forecasts up to 72 hours ahead by selecting different hours.

## Advantages

✅ **Instant loading** - 30-100KB files load instantly
✅ **No decompression** - Pre-formatted JSON  
✅ **No rate limiting** - Single file per hour request  
✅ **3-day forecasts** - View predictions for 72 hours ahead
✅ **Automatic updates** - New files generated every hour  
✅ **Automatic cleanup** - Old files removed after 96 hours  
✅ **Massive bandwidth savings** - 99.9% reduction vs individual files

## Storage Requirements

- **Hourly snapshots:** ~4.7MB (96 files)
- **Generated every hour:** 1 new file (~50KB)
- **Old files auto-deleted:** After 96 hours
- **Annual disk usage:** ~0.5GB (roughly 1 month of files at a time)

## Troubleshooting

**Issue:** Hourly snapshot not found
- Solution: Files are generated hourly. If missing, fallback to individual files works.

**Issue:** Forecast data is stale
- Solution: Snapshots auto-generated every hour. Check `generated_at` timestamp.

**Issue:** Missing sites in snapshot
- Solution: Only sites with valid forecasts are included. Check script output.

**Issue:** File size larger than expected
- Solution: Size varies (30-100KB) depending on number of available sites/hours.

## Performance Metrics

**Generation time:** ~2-3 seconds for 96 files  
**File count:** 89-96 files (depends on data availability)  
**Total size:** 4.7MB  
**Average file size:** 50-60KB  
**Compression ratio:** 99.9% vs individual files

## Future Enhancements

- Pre-compress snapshots with gzip (save another 80%)
- Generate daily summary files for historical data
- Add CDN caching headers for instant delivery
- Pre-generate 7-day forecasts
- Add weather alerts to snapshots

