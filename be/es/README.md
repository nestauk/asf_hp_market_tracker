# Logstash Ingestion Pipeline

## How to run

**N.B:** the following assumes you are running the ingestion on Ubuntu 22.04. If
this is not the case, please install the relevant OpenSearch Logstash 
version for your system.

Download the JDBC driver

```sh
wget https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-8.0.31.tar.gz
```

Untar

```sh
tar -xvf /<path_to_jdbc_tarball>
```

Install the `OpenSearch` version of `Logstash` (needed for AWS managed ES domains)

(Check before that the link below is the latest version [here](https://opensearch.org/downloads.html))

```sh
wget https://artifacts.opensearch.org/logstash/logstash-oss-with-opensearch-output-plugin-8.4.0-linux-x64.tar.gz
```

Untar

```sh
tar -xvf <path_to_logstash_tarball> -C <directory>
```

Set environment variables

```sh
# mysql connector, tested and working with mysql-connector-j-8.0.31.jar
export JDBC_DRIVER_PATH=<path_to_driver_directory>/mysql-connector-<version>.jar
# username and password for mysql db connection
export JDBC_USER=<mysql_username>
export JDBC_PASSWORD=<mysql_db_password>
# aws access, for access to the hosted ElasticSearch index/domain
export AWS_ACCESS_ID=<aws_access_key_id>
export AWS_ACCESS_KEY=<aws_secret_access_key>
# name of connection string to the hosted db
# this must contain the path to the db itself
export JDBC_CONNECTION_STRING=jdbc:<connection_string>:<port>/<database>
# name of table to ingest
export LOGSTASH_INPUT_TABLE=<your_table_name>
# name of ElasticSearch domain and index to write data to
export LOGSTASH_OUTPUT_DOMAIN=<domain> 
export LOGSTASH_OUTPUT_INDEX=<index>
```

It's usually easier to copy these commands to a configuration file, set the
appropriate values, then `source pipeline.rc` or equivalent to quickly load in the
environment variables.

Change to `Logstash` directory if it's not in the PATH:

```sh
cd /<path>/logstash-<version>
```

**N.B**: The pipeline expects an auto-increment column named `id` in order to be
able to run, please ensure this exists on the input MySQL table before running
the pipeline.

Run executable pointing to the pipeline config in this directory

```sh
bin/logstash -f /<path_to_repo>/be/es/managed_pipeline.conf
```

### Troubleshooting

If the pipeline runs OK but you get a message like

```
The driver has not received any packets from the server.
```

Make sure the instance you're running this pipeline from has permissions to
access the DB, e.g. that the IP is listed in the allowed incoming requests in
the EC2/RDS security configuration.

## Using the `ingest.sh` script

To attempt to fully automate the process described above for all
three environments (dev, staging and production), we have set 
up a script that uses a dev server hosted on EC2 to run all
the ingestion pipelines.

To access, make sure you can ssh into `13.40.13.228`. If you 
have access to the Nesta AWS, you can connect to the EC2 instance
there and simply add your public key to the `authorized_keys` file,
which will allow the script to run.

The script does the following things:

- Copies the latest pipeline configurations over to the server.
- Sources the necessary configurations for each environment.
- Iterates through each env and ingests the data from the SQL
    server to the given index (which you provide as a command line
    argument)
    
Usage:

```sh
npm run runLogstashPipeline -- test`
```

This will create an idex named `test` on

- hpmt.es.dev.dap-tools.uk
- hpmt.es.staging.dap-tools.uk
- hpmt.es.production.dap-tools.uk

Be careful about which index you specify, as the data will be
overwritten if you specify an existing index.

You can also specify a single domain by supplying a second argument:

```sh
npm run runLogstashPipeline -- test staging
```

Also of note: If the passwords for any of the DBs change, you
must ssh into the server and change the `{env}.rc` file,
where `env` is the name of the environment whose DB's password
has changed.

## Copying an Elasticsearch index using Logstash

To copy an index from a development or staging Elasticsearch server to a
production Opensearch server, use the `be/es/copy_pipeline.conf` file. This 
config file streamlines the process without requiring full ingestion scripts.

### Required Environment Variables

Set the following environment variables before running the Logstash pipeline:

```sh
# ElasticSearch source info
export LOGSTASH_INPUT_DOMAIN=<source_domain>
export LOGSTASH_INPUT_INDEX=<source_index>
export LOGSTASH_INPUT_PASSWORD=<source_password>
export LOGSTASH_INPUT_CERT=<cert_file_path>

# Opensearch destination info
export LOGSTASH_OUTPUT_DOMAIN=<destination_domain>
export LOGSTASH_OUTPUT_INDEX=<destination_index>
export LOGSTASH_OUTPUT_PASSWORD=<destination_password>
```

### Execution Steps

1. Navigate to the Logstash installation directory:

```sh
cd /<path>/logstash-<version>
```

2. Run Logstash with the specified pipeline configuration:

```sh
bin/logstash -f /<path_to_repo>/be/es/copy_pipeline.conf
```

### Important Note

If you plan to overwrite an existing index, ensure you remove it with an HTTP
`DELETE` request before executing the Logstash pipeline.

You can do this with `curl` or a similar tool. Example:

```sh
curl -X DELETE "https://<domain>:<port>/<index_name>" -u "username:password" --insecure
```
