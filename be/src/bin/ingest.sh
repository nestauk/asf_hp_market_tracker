if [ -z "$1" ]
then
    echo "No index name supplied"
    exit 1
fi

export AWS_PAGER=""

instance="i-0c069e95aaa193572"

aws ec2 start-instances --instance-ids $instance  --output=text
aws ec2 wait instance-running --instance-ids=$instance
sleep 10 # need to wait a little longer before being able to ssh
public_ip=$(aws ec2 describe-instances --instance-ids $instance --query 'Reservations[*].Instances[*].PublicIpAddress' --output text)

scp -o StrictHostKeyChecking=no es/hosted_pipeline.conf ubuntu@$public_ip:/home/ubuntu/hpmt_pipeline/hosted_pipeline.conf
scp -o StrictHostKeyChecking=no es/managed_pipeline.conf ubuntu@$public_ip:/home/ubuntu/hpmt_pipeline/managed_pipeline.confm1ss10n5
ssh -o StrictHostKeyChecking=no ubuntu@$public_ip 'bash -s' < src/bin/ingestServerSide.sh $*

aws ec2 stop-instances --instance-ids $instance --output=text