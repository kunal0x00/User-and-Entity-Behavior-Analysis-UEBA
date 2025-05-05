# User and Entity Behaviour Analysis (UEBA) with Real-Time Log Analysis and Visualization Dashboard

## 📌 Project Overview

This project implements a real-time User and Entity Behaviour Analysis (UEBA) system for identifying abnormal user activities and potential threats within an organizational network. It utilizes endpoint log data collected from Sysmon and Windows Event Viewer through custom-built log agents. These logs are aggregated on a central Python server, where an anomaly detection model (Isolation Forest) calculates risk scores. The results are then visualized on an interactive React-based dashboard with investigation and reporting features.

## 🔧 Technologies Used

### Frontend
- **React** (with **Vite.js**) – for fast, modern UI development
- **Recharts.js** – for dynamic graph and chart visualizations
- **Tailwind CSS** – for responsive and minimal styling

### Backend
- **Python (Flask/FastAPI)** – for building APIs to collect and serve logs
- **Pandas / NumPy** – for preprocessing and analysis
- **Scikit-learn** – for implementing the Isolation Forest anomaly detection model

### Data Sources
- **Sysmon Logs**
- **Windows Event Viewer Logs**

### Tools
- **Log Agent (Custom Python script)** – deployed on endpoints to extract and send logs
- **Log Aggregator Server** – central server to receive and process log data
- **PDFKit / ReportLab** – for generating downloadable PDF reports

## 📊 Features

### 🔹 Dashboard
- Real-time visualization of user behavior and log data
- Interactive graphs for network usage, file access, login anomalies
- User and Entities tab to explore user-specific logs
- Analytics tab to explore past incident history
- Filter and search functionality for detailed log inspection

### 🔹 API Integration
- Python-based server to fetch logs from endpoints
- Logs transmitted in real-time via REST API
- API endpoint supports custom filters for targeted analysis

### 🔹 Report Generation
- Generate daily, weekly, or custom period reports
- Export to PDF, Excel, or CSV formats
- Includes Executive Summary, Key Findings, Network Activity Analysis
- Allows investigation of specific users during the selected period

## 🧪 Experimental Setup

- Deployed log agents on Windows machines to collect Sysmon and Event Viewer logs
- Centralized log aggregator receives logs in JSON format
- Trained Isolation Forest model using historical data to detect anomalies
- Real-time scoring and visualization using dashboard

## 📁 Folder Structure

