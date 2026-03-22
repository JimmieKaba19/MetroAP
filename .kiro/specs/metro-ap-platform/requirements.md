# Requirements Document

## Introduction

MetroAP is a real-time public bus tracking and fleet intelligence platform built for Nairobi, Kenya, initially serving Super Metro routes. The platform consists of three distinct products sharing a common backend: a Passenger PWA for commuters to track buses and submit crowdsourced reports, a Conductor App (React Native, Android) for GPS streaming and exception reporting, and an Operator Dashboard (React, desktop) for fleet management and analytics. The shared backend handles GPS ingestion, map-matching, ETA computation, real-time WebSocket delivery, and push notifications.

The pilot covers the CBD–Thika Road corridor, expanding to all Super Metro routes, with a long-term growth path toward licensing the platform to other operators as a fleet management SaaS.

---

## Glossary

- **MetroAP**: The full platform comprising the Passenger PWA, Conductor App, Operator Dashboard, and Shared Backend.
- **Passenger_PWA**: The Progressive Web App used by commuters to track buses in real time.
- **Conductor_App**: The React Native Android application used by bus conductors to stream GPS and report exceptions.
- **Operator_Dashboard**: The React desktop web application used by fleet operators to manage routes, buses, conductors, and view analytics.
- **Location_Service**: The backend service that receives raw GPS pings from conductors, snaps them to the road network via OSRM, and writes the result to Redis.
- **ETA_Service**: The backend service that reads snapped positions from Redis and computes estimated arrival times for each stop on a route.
- **WebSocket_Server**: The backend component that pushes real-time bus position and ETA updates to connected Passenger_PWA clients.
- **Notification_Service**: The backend component that sends push notifications via Firebase Cloud Messaging.
- **Route_Manager**: The Operator_Dashboard module for creating, editing, and publishing route definitions.
- **Corridor**: A named geographic travel corridor (e.g., Thika Road, Westlands, Ngong Road, Eastlands).
- **Route_Variant**: A specific direction and service type on a Corridor (e.g., Outbound, Inbound, Express).
- **Stop**: A named boarding/alighting point with GPS coordinates and a geofence radius, belonging to a Route_Variant.
- **Geofence**: A circular boundary around a Stop used to trigger proximity events.
- **Bus**: A registered vehicle with a fleet number and passenger capacity.
- **Conductor**: A credentialed operator assigned to drive a Bus on a Route_Variant during a Shift.
- **Shift**: A single operational period during which a Conductor drives a Bus on a Route_Variant, with a recorded start time, end time, stops served, and incidents.
- **GPS_Ping**: A single location record emitted by the Conductor_App every 30 seconds, containing latitude, longitude, speed, heading, and timestamp.
- **Snapped_Position**: A GPS_Ping that has been map-matched to the nearest point on the route polyline by OSRM.
- **ETA**: Estimated time of arrival in minutes from the current Snapped_Position to a given Stop.
- **Occupancy**: The number of passengers currently on a Bus, expressed as a count and as a percentage of capacity.
- **Crowdsourced_Report**: A passenger-submitted observation tagged to a Route_Variant, Stop, and timestamp.
- **Exception_Report**: A conductor-submitted event (Delay, Breakdown, or Diversion) logged during a Shift.
- **Delay**: A condition where a Bus is running behind its expected schedule by a measurable number of minutes.
- **Breakdown**: A condition where a Bus is unable to continue its route due to a mechanical or operational failure.
- **Diversion**: A condition where a Bus deviates from its published route polyline.
- **OSRM**: Open Source Routing Machine, self-hosted, used for map-matching GPS pings to the road network.
- **Mapbox**: The mapping platform used for rendering route maps in the Passenger_PWA and Operator_Dashboard.
- **FCM**: Firebase Cloud Messaging, used to deliver push notifications to Passenger_PWA and Conductor_App users.
- **Redis**: In-memory data store used for real-time position caching and as a message broker between backend services.
- **Time_Series_DB**: A time-series database used to persist GPS history and analytics data.
- **Operator**: A Super Metro staff member with access to the Operator_Dashboard.
- **Super_Admin**: An Operator with full system access, including credential issuance and route publishing.

---

## Requirements

### Requirement 1: Passenger Route Selection

**User Story:** As a commuter, I want to select my corridor, direction, service type, and boarding stop, so that I see only the buses relevant to my journey.

#### Acceptance Criteria

1. THE Passenger_PWA SHALL display the four initial corridors: Thika Road, Westlands, Ngong Road, and Eastlands.
2. WHEN a commuter selects a Corridor, THE Passenger_PWA SHALL display the available Route_Variants for that Corridor, including direction (outbound/inbound) and service type (regular/express).
3. WHEN a commuter selects a Route_Variant, THE Passenger_PWA SHALL display the ordered list of Stops for that variant.
4. WHEN a commuter selects a boarding Stop, THE Passenger_PWA SHALL filter the live bus list to show only buses that have not yet passed that Stop.
5. THE Passenger_PWA SHALL persist the last selected Corridor, Route_Variant, and Stop in local storage so that the selection is restored on next launch.

---

### Requirement 2: Live Route Map

**User Story:** As a commuter, I want to see a live map of my selected route with bus positions, so that I can visually understand where buses are relative to my stop.

#### Acceptance Criteria

1. WHEN a Route_Variant is selected, THE Passenger_PWA SHALL render the route polyline on a Mapbox map with all Stops marked.
2. WHEN a GPS_Ping is received via WebSocket, THE Passenger_PWA SHALL update the bus position marker on the map within 2 seconds of receipt.
3. THE Passenger_PWA SHALL render each active Bus on the map as a pulsing dot coloured by the Corridor's accent colour.
4. THE Passenger_PWA SHALL highlight the commuter's selected boarding Stop with a distinct visual indicator.
5. WHEN a Bus is in Delay status, THE Passenger_PWA SHALL render its map marker in red.
6. WHILE a commuter's selected Stop is active, THE Passenger_PWA SHALL keep the map viewport centred on the route segment between the nearest active Bus and the selected Stop.

---

### Requirement 3: Bus Cards and ETA Display

**User Story:** As a commuter, I want to see bus cards with real-time ETAs, occupancy, and delay status, so that I can decide when to go to my stop.

#### Acceptance Criteria

1. THE Passenger_PWA SHALL display one Bus Card per active Bus on the selected Route_Variant that has not yet passed the commuter's boarding Stop.
2. EACH Bus Card SHALL display: the bus fleet number, the name of the Stop the bus is currently at or approaching, current speed in km/h, ETA in minutes to the commuter's boarding Stop, and an Occupancy bar.
3. WHEN the ETA value changes, THE Passenger_PWA SHALL update the Bus Card within 2 seconds of receiving the updated ETA from the WebSocket_Server.
4. WHEN a Bus has Delay status, THE Passenger_PWA SHALL render the Bus Card with a red background and display the delay in minutes.
5. THE Passenger_PWA SHALL display multiple Bus Cards simultaneously when multiple buses are active on the same Route_Variant.
6. WHEN a Bus has not sent a GPS_Ping for more than 90 seconds, THE Passenger_PWA SHALL display the last known position on the Bus Card with a timestamp indicating when it was last updated.

---

### Requirement 4: Crowdsourced Reports

**User Story:** As a commuter, I want to submit and upvote crowdsourced reports about bus conditions, so that other passengers have accurate real-time information.

#### Acceptance Criteria

1. THE Passenger_PWA SHALL allow a commuter to submit a Crowdsourced_Report of one of the following types: skip stop, accident, traffic, or occupancy correction.
2. WHEN a commuter submits a Crowdsourced_Report, THE Passenger_PWA SHALL tag the report with the active Route_Variant, the nearest Stop, and the current timestamp before sending it to the backend.
3. THE Passenger_PWA SHALL display submitted Crowdsourced_Reports in a feed, ordered by recency.
4. WHEN a commuter upvotes a Crowdsourced_Report, THE Passenger_PWA SHALL increment the vote count and send the upvote to the backend.
5. THE Passenger_PWA SHALL display the current vote count on each Crowdsourced_Report.
6. IF a commuter attempts to submit a Crowdsourced_Report without a Route_Variant selected, THEN THE Passenger_PWA SHALL prompt the commuter to select a route before submitting.

---

### Requirement 5: Push Notifications for Passengers

**User Story:** As a commuter, I want to receive push notifications about buses approaching my stop and delays, so that I can time my departure from home or office.

#### Acceptance Criteria

1. WHEN a Bus enters the Geofence of the Stop two stops before the commuter's selected boarding Stop, THE Notification_Service SHALL send an FCM push notification to the commuter's device.
2. WHEN a Bus transitions to Delay status, THE Notification_Service SHALL send an FCM push notification to all commuters who have subscribed to that Route_Variant.
3. WHEN a Crowdsourced_Report is submitted on a Route_Variant, THE Notification_Service SHALL send an FCM push notification to commuters subscribed to that Route_Variant within 30 seconds of report submission.
4. THE Passenger_PWA SHALL display notifications colour-coded by source: green for system-generated notifications, yellow for passenger-sourced notifications, and red for conductor-sourced notifications.
5. WHEN a commuter grants notification permission, THE Passenger_PWA SHALL register the device FCM token with the backend and associate it with the commuter's selected Route_Variant and Stop.
6. WHEN a commuter changes their selected Stop, THE Passenger_PWA SHALL update the FCM subscription on the backend to reflect the new Stop within 5 seconds.

---

### Requirement 6: Dark/Light Mode and PWA Installability

**User Story:** As a commuter, I want the app to support dark and light modes and be installable on my phone, so that it is comfortable to use in all lighting conditions and accessible without a browser.

#### Acceptance Criteria

1. THE Passenger_PWA SHALL support a dark mode and a light mode, switchable by the commuter at any time.
2. THE Passenger_PWA SHALL persist the commuter's theme preference in local storage and restore it on next launch.
3. THE Passenger_PWA SHALL be installable as a PWA on Android via the browser install prompt.
4. THE Passenger_PWA SHALL be installable as a PWA on iOS via the Safari "Add to Home Screen" flow.
5. THE Passenger_PWA SHALL register a service worker that caches the application shell, enabling the app to load on subsequent visits without a network connection.
6. WHEN the device is offline, THE Passenger_PWA SHALL display the last cached route and bus data with a visible offline indicator.
7. THE Passenger_PWA SHALL be responsive and optimised for mobile-first use, with a layout that adapts to tablet and desktop viewports.

---

### Requirement 7: Conductor Authentication

**User Story:** As a conductor, I want to log in with credentials issued by Super Metro management, so that my GPS stream is associated with my assigned bus and route.

#### Acceptance Criteria

1. THE Conductor_App SHALL present a credential-based login screen accepting a username and password.
2. WHEN a conductor submits valid credentials, THE Conductor_App SHALL authenticate against the backend and receive a session token valid for the duration of the Shift.
3. IF a conductor submits invalid credentials, THEN THE Conductor_App SHALL display an error message and allow the conductor to retry.
4. WHEN a conductor's session token expires mid-Shift, THE Conductor_App SHALL silently refresh the token without interrupting GPS streaming.
5. THE Conductor_App SHALL store the session token securely using Android Keystore and SHALL NOT store the plaintext password on the device.

---

### Requirement 8: Shift Initialisation

**User Story:** As a conductor, I want to select my route and direction at the start of my shift, so that my GPS stream is correctly attributed to the right Route_Variant.

#### Acceptance Criteria

1. WHEN a conductor is authenticated, THE Conductor_App SHALL display a shift setup screen showing the Route_Variants assigned to that conductor for the current day.
2. WHEN a conductor selects a Route_Variant and taps Start Route, THE Conductor_App SHALL record the Shift start time and begin GPS streaming.
3. THE Conductor_App SHALL display a confirmation screen showing the selected Route_Variant, direction, and start time before the conductor confirms Start Route.
4. WHEN a conductor taps End Route, THE Conductor_App SHALL stop GPS streaming, record the Shift end time, and submit the Shift record to the backend.
5. THE Shift record submitted at End Route SHALL include: Route_Variant, Bus fleet number, Conductor ID, start time, end time, list of Stops served, and list of Exception_Reports filed during the Shift.

---

### Requirement 9: Background GPS Streaming

**User Story:** As a conductor, I want the app to stream my GPS location silently in the background every 30 seconds, so that passengers receive accurate real-time bus positions without requiring me to interact with the app.

#### Acceptance Criteria

1. WHEN a Shift is active, THE Conductor_App SHALL emit a GPS_Ping to the Location_Service every 30 seconds via an Android foreground service.
2. EACH GPS_Ping SHALL contain: conductor ID, bus fleet number, Route_Variant ID, latitude, longitude, speed in km/h, heading in degrees, and a UTC timestamp.
3. THE Conductor_App SHALL display a persistent foreground notification indicating that GPS tracking is active, as required by Android foreground service policy.
4. WHILE the device has no network connectivity, THE Conductor_App SHALL buffer GPS_Pings locally and transmit them in order when connectivity is restored.
5. WHEN buffered GPS_Pings are transmitted after a connectivity gap, THE Location_Service SHALL process them in chronological order and SHALL NOT use them to update the live position shown to passengers if the gap exceeds 5 minutes.
6. THE Conductor_App SHALL request only the location permissions required for foreground service operation and SHALL NOT request background location permission beyond what Android policy requires for foreground services.

---

### Requirement 10: Conductor Exception Reporting

**User Story:** As a conductor, I want to report delays, breakdowns, and diversions from the app, so that passengers and operators are informed of service disruptions in real time.

#### Acceptance Criteria

1. THE Conductor_App SHALL provide a one-tap interface for filing an Exception_Report of type: Delay, Breakdown, or Diversion.
2. WHEN a conductor files a Delay report, THE Conductor_App SHALL require the conductor to enter the estimated delay in minutes and an optional free-text note before submission.
3. WHEN a conductor files a Breakdown report, THE Conductor_App SHALL record the current GPS coordinates and timestamp and submit the report to the backend immediately.
4. WHEN a conductor files a Diversion report, THE Conductor_App SHALL record the current GPS coordinates and allow the conductor to enter a free-text description of the diversion.
5. WHEN an Exception_Report is submitted, THE Notification_Service SHALL send push notifications to all passengers subscribed to the affected Route_Variant within 15 seconds.
6. WHEN an Exception_Report is submitted, THE Operator_Dashboard SHALL display the report on the live fleet map within 5 seconds.

---

### Requirement 11: Automatic Delay Detection

**User Story:** As a conductor, I want the app to detect when my bus has been stationary for too long and prompt me to file a report, so that passengers are not left without information during unexpected stops.

#### Acceptance Criteria

1. WHILE a Shift is active, THE Conductor_App SHALL monitor GPS_Pings for stationary conditions.
2. WHEN a Bus has reported a speed of 0 km/h for 3 or more consecutive GPS_Pings (90 seconds) without an active Exception_Report, THE Conductor_App SHALL display a prompt asking the conductor to confirm whether a delay should be reported.
3. WHEN the conductor confirms the delay prompt, THE Conductor_App SHALL pre-fill the Delay report with the elapsed stationary time in minutes and allow the conductor to adjust before submitting.
4. WHEN the conductor dismisses the delay prompt, THE Conductor_App SHALL not re-prompt for the same stationary event unless the bus moves and stops again.

---

### Requirement 12: Geofence Stop Triggers

**User Story:** As a passenger, I want to receive a notification when my bus enters the stop before mine, so that I know exactly when to head to my boarding stop.

#### Acceptance Criteria

1. WHILE a Shift is active, THE Location_Service SHALL evaluate each Snapped_Position against the Geofence of every Stop on the active Route_Variant.
2. WHEN a Bus enters the Geofence of a Stop, THE Notification_Service SHALL send an FCM push notification to all passengers who have selected the next Stop on that Route_Variant as their boarding Stop.
3. THE Geofence radius for each Stop SHALL be configurable per Stop by an Operator in the Operator_Dashboard, with a default radius of 150 metres.
4. WHEN a Bus exits a Stop Geofence and re-enters it within 5 minutes, THE Location_Service SHALL NOT fire a duplicate geofence entry event for that Stop and Bus combination.

---

### Requirement 13: Live Fleet Map (Operator Dashboard)

**User Story:** As an operator, I want to see all active buses on a live map, so that I can monitor the entire fleet at a glance.

#### Acceptance Criteria

1. THE Operator_Dashboard SHALL display all active Buses on a Mapbox map, colour-coded by Corridor.
2. WHEN a Snapped_Position update is received, THE Operator_Dashboard SHALL update the corresponding Bus marker on the fleet map within 5 seconds.
3. WHEN an Operator clicks a Bus marker, THE Operator_Dashboard SHALL display a detail panel showing: current Stop, speed, Occupancy, assigned Conductor name, and the 30-minute position history trail.
4. THE Operator_Dashboard SHALL render the 30-minute position history trail as a faded polyline behind the Bus marker.
5. WHEN a Bus has an active Exception_Report, THE Operator_Dashboard SHALL display a visual indicator on the Bus marker (e.g., a warning icon) and show the Exception_Report details in the Bus detail panel.
6. WHEN a Bus has not sent a GPS_Ping for more than 90 seconds, THE Operator_Dashboard SHALL display the Bus marker in a greyed-out state with a "last seen" timestamp.

---

### Requirement 14: Route Management (Operator Dashboard)

**User Story:** As an operator, I want to create, edit, and publish routes with stops and geofences, so that the platform accurately reflects the routes Super Metro operates.

#### Acceptance Criteria

1. THE Route_Manager SHALL allow an Operator to create a new Route_Variant by drawing a polyline on the Mapbox map and pinning Stop markers along the polyline.
2. WHEN an Operator pins a Stop, THE Route_Manager SHALL require the Operator to enter a Stop name and SHALL auto-populate the GPS coordinates from the pin location.
3. THE Route_Manager SHALL allow an Operator to set the Geofence radius for each Stop individually, with a minimum radius of 50 metres and a maximum radius of 500 metres.
4. WHEN an Operator publishes a Route_Variant, THE Route_Manager SHALL make the Route_Variant available to the Passenger_PWA and Conductor_App within 60 seconds.
5. THE Route_Manager SHALL allow an Operator to create multiple Route_Variants under a single Corridor (e.g., outbound, inbound, express).
6. WHEN an Operator edits a published Route_Variant, THE Route_Manager SHALL require the Operator to confirm the change before applying it, and SHALL notify active Conductors on that Route_Variant of the update.
7. THE Route_Manager SHALL allow an Operator to deactivate a Route_Variant, which removes it from the Passenger_PWA and Conductor_App without deleting the historical data.

---

### Requirement 15: Bus and Conductor Management (Operator Dashboard)

**User Story:** As an operator, I want to register buses and issue conductor credentials, so that the fleet is accurately represented in the system.

#### Acceptance Criteria

1. THE Operator_Dashboard SHALL allow a Super_Admin to register a new Bus by entering a fleet number and passenger capacity.
2. THE Operator_Dashboard SHALL allow a Super_Admin to issue Conductor credentials (username and temporary password) and assign the Conductor to one or more Route_Variants per shift schedule.
3. WHEN a Super_Admin issues Conductor credentials, THE Operator_Dashboard SHALL display the temporary password once and SHALL NOT store it in plaintext after display.
4. THE Operator_Dashboard SHALL display a list of all registered Buses with their current status (active on route, idle, or offline).
5. THE Operator_Dashboard SHALL display a list of all Conductors with their current assignment (active Shift, no active Shift, or suspended).
6. THE Operator_Dashboard SHALL allow a Super_Admin to deactivate a Conductor account, which immediately invalidates any active session tokens for that Conductor.

---

### Requirement 16: Shift History (Operator Dashboard)

**User Story:** As an operator, I want to review completed shift records, so that I can audit conductor activity and investigate incidents.

#### Acceptance Criteria

1. THE Operator_Dashboard SHALL display a paginated list of completed Shifts, filterable by Conductor, Route_Variant, Bus, and date range.
2. WHEN an Operator selects a Shift from the list, THE Operator_Dashboard SHALL display the full Shift record including: Route_Variant, Bus, Conductor, start time, end time, stops served, and all Exception_Reports filed during the Shift.
3. THE Operator_Dashboard SHALL display the GPS track for a completed Shift as a polyline on the Mapbox map when the Shift detail view is open.
4. THE Operator_Dashboard SHALL retain Shift records for a minimum of 12 months.

---

### Requirement 17: Analytics (Operator Dashboard)

**User Story:** As an operator, I want to view analytics on delays, occupancy, skipped stops, and conductor incidents, so that I can identify operational problems and improve service.

#### Acceptance Criteria

1. THE Operator_Dashboard SHALL display a delays-per-route report showing average delay duration per Route_Variant, filterable by date range.
2. THE Operator_Dashboard SHALL display a peak occupancy report showing average and maximum Occupancy per Route_Variant per hour of day, filterable by date range.
3. THE Operator_Dashboard SHALL display a skipped-stops report showing the frequency of skip-stop Crowdsourced_Reports per Stop per Route_Variant, filterable by date range.
4. THE Operator_Dashboard SHALL display a conductor incident frequency report showing the number of Exception_Reports filed per Conductor, filterable by date range and exception type.
5. WHEN an Operator exports an analytics report, THE Operator_Dashboard SHALL generate a CSV file containing the report data and initiate a browser download.

---

### Requirement 18: GPS Ingestion and Map-Matching

**User Story:** As a platform operator, I want all conductor GPS pings to be snapped to the road network, so that bus positions are accurate and not scattered off-road due to GPS noise.

#### Acceptance Criteria

1. WHEN the Location_Service receives a GPS_Ping, THE Location_Service SHALL submit the coordinates to OSRM for map-matching against the active Route_Variant's polyline within 500 milliseconds.
2. WHEN OSRM returns a Snapped_Position, THE Location_Service SHALL write the Snapped_Position to Redis with a TTL of 120 seconds.
3. WHEN OSRM returns a map-matching confidence score below 0.6, THE Location_Service SHALL log the low-confidence ping and use the raw GPS coordinates as a fallback.
4. THE Location_Service SHALL write each GPS_Ping and its corresponding Snapped_Position to the Time_Series_DB for historical analysis.
5. IF the Location_Service cannot reach OSRM within 500 milliseconds, THEN THE Location_Service SHALL use the raw GPS coordinates and flag the position as unmatched.

---

### Requirement 19: ETA Computation

**User Story:** As a platform operator, I want ETAs to be computed from snapped positions and delivered to passengers in real time, so that commuters receive accurate arrival predictions.

#### Acceptance Criteria

1. WHEN a Snapped_Position is written to Redis, THE ETA_Service SHALL compute the ETA to each remaining Stop on the Route_Variant within 1 second.
2. THE ETA_Service SHALL compute ETAs using the distance along the route polyline from the Snapped_Position to each Stop, divided by the rolling average speed of the Bus over the last 3 GPS_Pings.
3. WHEN the rolling average speed is below 5 km/h, THE ETA_Service SHALL use a default speed of 15 km/h for ETA computation to avoid unrealistically large ETA values during brief stops.
4. WHEN ETAs are computed, THE WebSocket_Server SHALL broadcast the updated Bus state (position, speed, ETAs, status) to all connected Passenger_PWA clients subscribed to that Route_Variant within 2 seconds.
5. THE ETA_Service SHALL write computed ETAs to Redis with a TTL of 90 seconds so that newly connected clients can receive the latest state without waiting for the next GPS_Ping.

---

### Requirement 20: Offline Resilience

**User Story:** As a commuter or conductor, I want the platform to degrade gracefully when connectivity is lost, so that I still have useful information during network outages.

#### Acceptance Criteria

1. WHEN the Passenger_PWA loses WebSocket connectivity, THE Passenger_PWA SHALL display a visible offline indicator and continue showing the last received bus positions with their timestamps.
2. WHEN the Passenger_PWA regains WebSocket connectivity, THE Passenger_PWA SHALL reconnect automatically and refresh all bus positions within 5 seconds.
3. WHILE the Conductor_App has no network connectivity, THE Conductor_App SHALL continue GPS_Ping collection and buffer pings locally with a maximum buffer of 200 pings.
4. WHEN the Conductor_App regains connectivity, THE Conductor_App SHALL transmit buffered GPS_Pings to the Location_Service in chronological order before resuming live streaming.
5. THE Passenger_PWA service worker SHALL cache the application shell, route definitions, and stop data so that the app loads and displays static route information without a network connection.

---

### Requirement 21: Data Serialisation and API Contracts

**User Story:** As a platform engineer, I want all data exchanged between clients and the backend to follow defined schemas, so that integration errors are caught early and the system is maintainable.

#### Acceptance Criteria

1. THE backend API SHALL serialise all responses as JSON conforming to documented OpenAPI 3.1 schemas.
2. WHEN a client sends a malformed request body, THE backend API SHALL return an HTTP 400 response with a JSON error object containing a machine-readable error code and a human-readable message.
3. THE Location_Service SHALL parse incoming GPS_Ping payloads against a defined schema and SHALL reject pings missing required fields with an HTTP 422 response.
4. FOR ALL valid GPS_Ping objects, serialising then deserialising the object SHALL produce an equivalent GPS_Ping (round-trip property).
5. THE WebSocket_Server SHALL serialise all real-time messages as JSON and SHALL include a message type field in every frame to allow clients to route messages without inspecting payload structure.
6. WHEN the backend API version changes in a breaking way, THE backend API SHALL increment the major version in the URL path (e.g., /v2/) and SHALL maintain the previous version for a minimum of 90 days.

---

### Requirement 22: Security and Authentication

**User Story:** As a platform operator, I want all API endpoints and real-time connections to be authenticated and authorised, so that passenger data and fleet operations are protected.

#### Acceptance Criteria

1. THE backend API SHALL require a valid JWT bearer token on all endpoints except the public passenger read endpoints (bus positions, ETAs, route definitions).
2. WHEN a request is received with an expired or invalid JWT, THE backend API SHALL return an HTTP 401 response.
3. THE Conductor_App SHALL authenticate using short-lived JWTs (maximum 8-hour expiry) with silent refresh via a refresh token stored in Android Keystore.
4. THE Operator_Dashboard SHALL authenticate using short-lived JWTs (maximum 8-hour expiry) with silent refresh via a refresh token stored in an HttpOnly cookie.
5. THE backend API SHALL enforce role-based access control: Conductor role may only write GPS_Pings and Exception_Reports for their own active Shift; Operator role may read all fleet data and manage routes and buses; Super_Admin role may additionally manage Conductor accounts and system configuration.
6. THE backend API SHALL rate-limit GPS_Ping ingestion to a maximum of 5 pings per conductor per minute to prevent abuse.

---

### Requirement 23: Scalability and Performance

**User Story:** As a platform operator, I want the backend to handle the full Super Metro fleet concurrently, so that the platform remains responsive during peak hours.

#### Acceptance Criteria

1. THE Location_Service SHALL process a minimum of 200 concurrent GPS_Ping streams without exceeding a 95th-percentile processing latency of 1 second per ping.
2. THE WebSocket_Server SHALL support a minimum of 5,000 concurrent Passenger_PWA connections without exceeding a 95th-percentile message delivery latency of 2 seconds.
3. THE backend API SHALL return route definition and stop list responses within 300 milliseconds at the 95th percentile under normal load.
4. THE ETA_Service SHALL complete ETA computation for all stops on a Route_Variant within 1 second of receiving a Snapped_Position update.
5. THE Time_Series_DB SHALL retain GPS history data for a minimum of 12 months and SHALL support analytics queries over 30-day windows within 10 seconds.
