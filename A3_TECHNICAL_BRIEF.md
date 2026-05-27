# Cloud Availability Prediction for QOSMIC Ground Stations
## A Research Prototype for Operational Scheduling

**Author:** Sreevidya Jayachandran  
**Date:** May 2026  
**Status:** Research prototype

---

## Abstract

Ground station availability is a hard constraint on QOSMIC's link budget and 
customer SLA commitments. Cloud cover is the primary source of outage for 
optical ground stations. This brief describes a machine learning prototype for 
predicting cloud presence from multispectral satellite imagery, evaluated on 
synthetic Landsat-band data with realistic noise characteristics. The prototype 
achieves F1 0.9873 and IoU 0.9749 at a monthly operational cost of $0.16 for 
5 ground stations and $1.56 for 50.

---

## Motivation

QOSMIC's free-space optical links require clear line of sight between satellite 
and ground station. A single cloud layer can cause a complete link outage. 
Currently, cloud avoidance relies on weather APIs and human judgment. At 5 
ground stations this is manageable. At 50 it is not.

An automated cloud prediction layer that runs every 15 minutes per station 
would allow QOSMIC to proactively reschedule passes, pre-notify customers of 
outage windows, and optimize ground station selection in multi-station 
deployments.

---

## Related Work

Four papers informed this prototype:

**CloudSEN12** (Aybar et al., 2022): Large-scale benchmark for cloud 
segmentation in Sentinel-2 imagery. Establishes NDVI and NDSI as strong 
spectral features for cloud detection.

**38-Cloud** (Mohajerani et al., 2019): Landsat-8 cloud segmentation dataset. 
Demonstrates that random forest baselines achieve F1 around 0.89 on real data.

**Segment Anything for EO** (Osco et al., 2023): Shows SAM generalizes to 
earth observation with minimal fine-tuning. Promising for zero-shot cloud 
boundary detection.

**SMARTIES** (Hollstein et al., 2016): Physics-informed spectral features 
for cloud detection. Validates NDSI as discriminative for thin cloud versus 
clear sky.

---

## Methodology

**Data:** Synthetic multispectral dataset (10,000 pixels) simulating Landsat 
bands (Blue, Green, Red, NIR) with realistic noise (Gaussian sigma 0.05-0.08) 
and class overlap. 70% clear sky, 30% cloud. Class distributions derived from 
CloudSEN12 spectral statistics.

**Features:** 6 input features: Blue, Green, Red, NIR reflectance bands plus 
NDVI (Normalized Difference Vegetation Index) and NDSI (Normalized Difference 
Snow Index). NDVI and NDSI are physics-grounded features that exploit the 
known spectral signature of clouds versus vegetation and surface.

**Model:** Random Forest (100 estimators). Chosen for interpretability, 
training speed, and strong baseline performance on tabular spectral data. 
No GPU required for training or inference at this scale.

**Evaluation:** 80/20 train/test split. Metrics: F1 score and IoU (Jaccard).

---

## Results

| Metric | Score |
|---|---|
| F1 Score | 0.9873 |
| IoU (Jaccard) | 0.9749 |
| Accuracy | 0.99 |
| Training time | 1.31s |
| Inference time | ~0.01s per scene |

**Cost projection on H200 GPUs ($3.89/hour):**

| Scale | Monthly inference | Monthly retraining | Total |
|---|---|---|---|
| 5 ground stations | $0.16 | $0.01 | $0.16 |
| 50 ground stations | $1.56 | $0.01 | $1.56 |

At this cost structure, running the model every 15 minutes across 50 ground 
stations costs less than $2 per month. The H200s are not the bottleneck. 
Data quality is.

---

## Limitations

The synthetic dataset is the honest limitation of this prototype. Real 
Landsat imagery has sensor noise, atmospheric scattering, sun glint, and 
thin cloud cases where the spectral signature overlaps with haze and snow. 
The F1 of 0.9873 will not hold on real data without retraining on labeled 
satellite imagery.

The model also does not predict cloud cover in advance. It classifies current 
state from current imagery. A forecasting layer (LSTM or NWP integration) 
would be required for proactive scheduling.

---

## What I Worried About

The synthetic data felt too clean. When F1 came out at 1.0 on the first run 
I knew the class distributions were too well separated. I added Gaussian noise 
and overlapping beta distributions to simulate the ambiguous cases that make 
real cloud detection hard. The resulting 0.9873 feels more honest. But I am 
still not sure how much that number would degrade on real imagery.

I also worried about whether this problem is worth solving with ML at all. 
Weather APIs (OpenWeatherMap, Tomorrow.io) already provide cloud cover 
forecasts at reasonable resolution. The honest answer is: ML wins when you 
need hyperlocal precision at a specific ground station, not regional cloud 
cover. Whether QOSMIC's stations are dense enough to need that precision is 
an operational question I cannot answer from outside.

---

## What I Would Do Differently With One More Week

Download the actual 38-Cloud Landsat dataset and retrain. The synthetic 
data was a pragmatic choice given time constraints. Real data would produce 
a number worth trusting.

Add a temporal layer. Single-scene classification misses cloud movement 
patterns. A sequence of 4 scenes at 15 minute intervals fed into an LSTM 
would give a 1 hour forecast, which is the actual operational need.

Integrate with QOSMIC's pass scheduling. The model output needs to connect 
to something. A simple API that returns cloud probability for a given 
station and time window, consumed by the scheduling system, would close 
the loop.

---

## What I Am Uncertain About

1. Whether synthetic spectral data is representative enough to draw 
conclusions about real sensor performance.

2. Whether 15 minute refresh is the right cadence. Depends on cloud 
movement speed at QOSMIC's ground station locations.

3. Whether Random Forest is the right model class. SAM or a fine-tuned 
SegFormer on real imagery would likely outperform this baseline 
significantly.

4. The actual cost of H200 access at QOSMIC. Lambda Labs pricing was used 
as a proxy. Internal allocation cost may be very different.

5. Whether this problem is better solved by integrating an existing 
meteorological API rather than training a custom model. The honest answer 
depends on precision requirements I do not have access to.

---

## Recommended Next Steps for QOSMIC

1. Download 38-Cloud dataset and retrain. Two days of work. Produces a 
number worth trusting.

2. Run inference on one real ground station location using Sentinel-2 
imagery from Copernicus Open Access Hub. Free data, immediate operational 
relevance.

3. Define precision requirement. If regional cloud cover from Tomorrow.io 
is sufficient, skip the ML entirely. If hyperlocal per-station precision 
matters, invest in the real data pipeline.

4. Connect to scheduling system. A model that sits in a notebook is not 
operational. The value is in the API layer that consumes the prediction.
