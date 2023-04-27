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
