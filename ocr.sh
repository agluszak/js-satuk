#!/bin/bash

# check if there is exactly one argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <file>"
    exit 1
fi

file=$1
filename=$(basename -- "$file")

if [ ! -f "$filename.easyocr-en.txt" ]; then
    echo $file
    easyocr -l en -f $file --detail 0 2>/dev/null >$filename.easyocr-en.txt
    easyocr -l pl -f $file --detail 0 2>/dev/null >$filename.easyocr-pl.txt
fi
