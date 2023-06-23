## Custom response codes

### 1xx

Codes where we need to change the response to an aggregation request.

#### 100

```json
{
    "code": 100,
    "message": "no documents found for given filter"
}
```

The filter produces no documents on which to aggregate.

#### 101

```json
{ 
    "code": 101, 
    "data": {
        "count": 3
    }
    "message": "minDocCount threshold exceeded" 
}
```

The number of documents to be aggregated on are too few. Returns the number of
documents that were filtered, in the example above, only three documents were
retrieved.

### 2xx

Successful responses

#### 200

```json
{
    "code": 200,
    "data": payload,
    "message": "aggregation succesful"
}
```

The aggregation was successfull, and the results are stored in the data key.

### Certification Dates and Ranges

The vast majority of our records for installations include a single
pair of start and end date values indicating the span of time that
that particular installer was certified (if they were certified
that is - you do not have to have a certificate to install a Heat
Pump). However, there are a number of installers that have multiple
start and end dates, indicating that there were periods were their
certificates lapsed and they did not renew them.

For visualisations that refer to certification dates, we use a
simpler heuristic where we find the minimum start date and
maximum end date for all certified installers. This does not
take into account the outliers where there was a gap in time where
they where not certified. We feel confident that the heuristic
is a very close approximation to the true numbers, and show the
correct general distributions and shapes of the graphs etc. This
is motivated by the fact that the average number of certificates
per certified installer is `1.0427`, with a variance of `0.1554`,
indicating that the vast majority of certified installers
have only one certification. The full output and associated
query to generate these statistics can be found
[here](https://github.com/nestauk/asf_hp_market_tracker/blob/dev/be/test/routes/api/terms1_cardinality2/09.json).