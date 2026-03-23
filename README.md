## Overview

[![Join the chat at https://gitter.im/opentripplanner/OpenTripPLanner](https://badges.gitter.im/opentripplanner/OpenTripPlanner.svg)](https://gitter.im/opentripplanner/OpenTripPlanner)
[![Matrix](https://img.shields.io/matrix/opentripplanner%3Amatrix.org?label=Matrix%20chat&?cacheSeconds=172800)](https://matrix.to/#/#opentripplanner_OpenTripPlanner:gitter.im)
[![codecov](https://codecov.io/gh/opentripplanner/OpenTripPlanner/branch/dev-2.x/graph/badge.svg?token=ak4PbIKgZ1)](https://codecov.io/gh/opentripplanner/OpenTripPlanner)
[![Commit activity](https://img.shields.io/github/commit-activity/y/opentripplanner/OpenTripPlanner)](https://github.com/opentripplanner/OpenTripPlanner/graphs/contributors)
[![Docker Pulls](https://img.shields.io/docker/pulls/opentripplanner/opentripplanner)](https://hub.docker.com/r/opentripplanner/opentripplanner)

OpenTripPlanner (OTP) is an open source multi-modal trip planner, focusing on travel by scheduled
public transportation in combination with bicycling, walking, and mobility services including bike
share and ride hailing. Its server component runs on any platform with a Java virtual machine (
including Linux, Mac, and Windows). It exposes GraphQL APIs that can be accessed by various
clients including open source Javascript components and native mobile applications. It builds its
representation of the transportation network from open data in open standard file formats (primarily
GTFS and OpenStreetMap). It applies real-time updates and alerts with immediate visibility to
clients, finding itineraries that account for disruptions and service changes.

Note that this branch contains **OpenTripPlanner 2**, the second major version of OTP, which has
been under development since 2018 and is now the dominant one and the only one being supported.

## Development

OpenTripPlanner is a collaborative project incorporating code, translation, and documentation from
contributors around the world. We welcome new contributions.
Further [development guidelines](http://docs.opentripplanner.org/en/latest/Developers-Guide/) can be
found in the documentation.

### Contributing Guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md)

### Development History

The OpenTripPlanner project was launched by Portland, Oregon's transport agency
TriMet (http://trimet.org/) in July of 2009. As of this writing in September 2025, it has been in
development for over 16 years. See the main documentation for an overview
of [OTP history](http://docs.opentripplanner.org/en/dev-2.x/History/) and a list
of [cities and regions using OTP](http://docs.opentripplanner.org/en/dev-2.x/Deployments/) around
the world.

## Measuring OTP Performance

[📊 Dashboard](https://otp-performance.leonard.io/) 

We run a speed test (included in the code) to measure the performance for every PR merged into OTP. 

[More information about how to set up and run it.](./test/performance/README.md)

## Repository Layout

The main Java server code is in `application/src/main/`. OTP also includes a Javascript client 
based on the MapLibre mapping library in `client/src/`. This client is now used for testing, with
most major deployments building custom clients from reusable components. The Maven build produces a
unified ("shaded") JAR file at `otp-shaded/target/otp-shaded-VERSION.jar` containing all necessary
code and dependencies to run OpenTripPlanner.

Additional information and instructions are available in
the [main documentation](http://docs.opentripplanner.org/en/dev-2.x/), including a
[quick introduction](http://docs.opentripplanner.org/en/dev-2.x/Basic-Tutorial/).

## Getting in Touch

The fastest way to get help is to use our [Gitter chat room](https://gitter.im/opentripplanner/OpenTripPlanner) where most of the core developers
are. Bug reports may be filed via the Github [issue tracker](https://github.com/openplans/OpenTripPlanner/issues). The OpenTripPlanner [mailing list](http://groups.google.com/group/opentripplanner-users)
is used almost exclusively for project announcements. The mailing list and issue tracker are not
intended for support questions or discussions. Please use the chat for this purpose. Other details
of [project governance](http://docs.opentripplanner.org/en/dev-2.x/Governance/) can be found in the main documentation.

## OTP Ecosystem

- [awesome-transit](https://github.com/MobilityData/awesome-transit) Community list of transit APIs,
  apps, datasets, research, and software.

## Reachability Feature

The feature added in this fork is a reachability visualization. The idea is to visualize the reachability of a target location via all kinds of transportation. In a predefined radius locations are sampled uniformly. Connections from these sample locations towards the target location are calculated by the OTP routing algorithm for a specified time. The fastest travel time of a location is displayed as a color at each sampled location. Currently the arbitrary cutoffs for different fastest travel times are defined in 'useReachability.ts' with green dots under 25 minutes, yellow between 25 and 45 minutes, red for travel time longer than 45 minutes.

### Setup

Clone this repo and follow the instructions above to build the jar with maven. Afterwards you need to find GTFS data for public transit data and map data for your area. I used the following data sources:

Public Transit in Germany: https://gtfs.de/en/feeds/
OpenStreetMap Data (I used NRW data because of RAM size issues): https://download.geofabrik.de/

Follow these steps to start your local server with a basic GUI: https://docs.opentripplanner.org/en/latest/Basic-Tutorial/#simple-one-step-server

The basic GUI lets you plan journeys like any other journey planning tool. To enable the reachability feature you have to build the client yourself with 'npm run dev' in the client folder. Then open the extended GUI following the link provided in the console output after building.

In the extended GUI as soon as you select a location as your target on the map, the reachability to that location will be displayed. At the moment only walks are considered for fastest paths as there is still some debugging to do. Also the radius and sample size are hardcoded because of the experimental nature of this project.

The extension consists of two util files in 'samplePoints.ts' and 'runTripQuery.ts' where the starting points are sampled and where each query for the GraphQL API are prepared. In 'useReachability.ts' the hook is managed, which triggers when the journey target location is changed. In 'MapView.tsx' further changes were made to visualize the results.