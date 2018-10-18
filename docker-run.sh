#! /bin/bash
docker run -ti \
       --net=host \
       hasura/graphql-engine:v1.0.0-alpha24 \
       graphql-engine \
       --database-url postgres://andreas@192.168.99.100/dcex_dev \
       serve --enable-console
