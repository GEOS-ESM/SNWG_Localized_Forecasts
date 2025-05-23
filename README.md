# Air Quality Forecasts and Distributed Pandora Sensors

![Air Quality Illustration](https://earthdata.nasa.gov/s3fs-public/2024-10/earth-data-11.jpg?VersionId=Hq77PMM5qXe4v5zCbWH0iTbBcnHzR_7l)

This NASA-backed initiative aims to improve the accuracy and availability of air quality data by combining Earth observations, advanced modeling, and expanded ground-based sensor networks. A major component is the **GEOS-CF-based localized forecasting tool**, which empowers localized air quality prediction capabilities.

---

## GEOS-CF Localized Forecasts

A lightweight forecasting tool leveraging NASA GMAO’s GEOS-CF model integrated with local observation data including Pandora.

---

## Aim and Scope

- Enable high-resolution, site-specific air quality forecasts.
- Make GEOS-CF modeling outputs actionable and localized using real-time observations.
- Provide an accessible online platform to train, deploy, and evaluate forecast models per location.

---

## Core Features

- **Pretrained models**: Use existing models without retraining for immediate forecasting.
- **Online training**: Train and deploy models for specific locations in real time.
- **Configuration exploration**: View and modify location-specific forecast settings.
- **Forecast visualization**: Generate and export forecast plots using built-in tools.
- **Community contributions**: Support for saving models and sharing local data.
- **Custom forecast generation**: One-call function to generate outputs in various formats:
  - 📊 DataFrames
  - 📈 Forecast plots
  - 🧩 SHAP (SHapley Additive exPlanations) values for uncertainty and feature impact analysis

---

## Access and Integration

- 🌐 **Pandora data**: Available via the [Pandonia Global Network (PGN)](https://pandonia.net).
- 📱 **PM2.5 Forecasts**: Accessible through this website.
- 🔧 **GEOS-CF Forecast Tool**: Use the online tool for real-time model training and forecasting.

---

## 📄 License

[MIT License](LICENSE)

## 🙌 Acknowledgments

This project is supported by NASA and leverages contributions from the scientific community, developers, and atmospheric monitoring networks worldwide.
