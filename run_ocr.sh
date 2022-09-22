#!/bin/bash

pushd images

processed=0

for file in *.png *.jpg; do
    echo "Processed: $processed"
    ../ocr.sh $file
    processed=$((processed + 1))
done

echo "Processed $processed files"
popd