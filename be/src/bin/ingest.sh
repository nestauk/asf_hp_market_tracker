if [ -z "$1" ]
then
    echo "No index name supplied"
    exit 1
fi

cd pipeline
export LOGSTASH_OUTPUT_INDEX=$1
source input.rc

result=$(mysql --login-path=missions -e "use production_asf; SELECT COUNT(*) FROM hpmt_gold_interim;")
count=$(echo $result | awk '{print $2}')

for domain in dev staging production
do 
    source $domain.rc
    export LOGSTASH_OUTPUT_DOMAIN="https://hpmt.es.$domain.dap-tools.uk"
    echo "--- 0" > last_run.yml # set value read by configuration to start at 0
    last_sql_value=0 
    while [ $last_sql_value -le $count ]
    do
        if [[ "$domain" == "production" ]]
        then
            ./logstash -f /home/ubuntu/pipeline/managed_pipeline.conf
        else
            ./logstash -f /home/ubuntu/pipeline/hosted_pipeline.conf
        fi
        last_sql_value=$(($last_sql_value + 50000)) # increase the number of rows already read
        echo "--- $last_sql_value" > last_run.yml
    done

    echo "Finished"
done
