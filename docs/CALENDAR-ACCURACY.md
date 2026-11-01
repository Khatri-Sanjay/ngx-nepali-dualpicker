# Calendar accuracy and range

The BS month-length table, epoch and algorithm were reused. This checkpoint does not independently certify historical accuracy.

- Epoch: BS 2000-01-01 corresponds to AD 1943-04-14.
- BS table years: 2000–2139 inclusive.
- Gregorian validation years: 1943–2082 inclusive.
- Conversion requires both a valid source and a valid result. AD dates before the epoch and BS dates producing AD dates beyond configured bounds are rejected. Nominal year ranges are not all mutually convertible.
- Table-offset round trips test internal consistency. Independent historical references and precise terminal conversion dates remain release requirements.

Core/service date structures use months 1–12. Calendar dates are not timestamps. Date inputs read local Gregorian fields; current-date helpers read the local clock. No timezone or wall-clock date-time API was added.

No holiday dataset is shipped. Verified annual sources are required before adding one.
