cd hpmt_pipeline
source input.rc

export LOGSTASH_OUTPUT_INDEX=$1
result=$(mysql --login-path=missions -e "use production_asf; SELECT COUNT(*) FROM hpmt_gold_interim;")
count=$(echo $result | awk '{print $2}')
if [ "$2" ]
then
    domains=$2
else
    declare -a domains=("dev" "staging" "production")
fi

for domain in "${domains[@]}"
do 
    source $domain.rc
    export LOGSTASH_OUTPUT_DOMAIN="https://hpmt.es.$domain.dap-tools.uk"
    echo "--- 0" > last_run.yml # set value read by configuration to start at 0
    last_sql_value=0 
    while [ $last_sql_value -le $count ]
    do
        if [[ "$domain" == "production" ]]
        then
            ./logstash -f /home/ubuntu/hpmt_pipeline/managed_pipeline.conf
        else
            ./logstash -f /home/ubuntu/hpmt_pipeline/hosted_pipeline.conf
        fi
        last_sql_value=$(($last_sql_value + 50000)) # increase the number of rows already read
        echo "--- $last_sql_value" > last_run.yml
    done

    echo "Finished"
done