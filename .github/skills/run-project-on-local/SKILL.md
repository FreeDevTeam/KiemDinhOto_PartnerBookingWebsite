---
name: run-project-on-local
description: "Use when setting up and running the project on a local development environment. Covers prerequisites, installation steps, environment configuration, and common troubleshooting tips for local setup."
---

# Constants And Config

## When to Use

- khi có thay đổi về cấu hình môi trường hoặc dependencies
- khi cần debug hoặc phát triển tính năng mới trên local

## Goals

- tránh lỗi thường gặp khi thiết lập môi trường local
- đảm bảo project chạy đúng trên máy của developer
- cung cấp hướng dẫn rõ ràng cho các bước cài đặt và cấu hình

## Procedure

Cách 1: chạy trực tiếp bằng lệnh docker
1. Kiểm tra port 3001 có được sử dụng bởi ứng dụng khác không, nếu có thì dừng ứng dụng đó hoặc đổi port
2. gọi lệnh docker trên command line để build và chạy project trên local 
`docker rm -f $(docker ps -aq --filter ancestor=demopartnerbooking) 2>/dev/null; docker rmi -f demopartnerbooking && docker build . -t demopartnerbooking && docker run -p 3001:80 demopartnerbooking`

Cách 2: chạy bằng script auto lấy ENV từ `.env` + tự map `ARG` theo `Dockerfile` (khuyến nghị)
1. Chạy script:
`bash ops/bin/2.2.0.local-run-auto-env.sh .env`
2. Nếu cần custom cổng và tên image/container:
`PORT=3001 IMAGE_NAME=demopartnerbooking CONTAINER_NAME=demopartnerbooking-local bash ops/bin/2.2.0.local-run-auto-env.sh .env`
3. Script sẽ tự:
- đọc tất cả `ARG` từ `Dockerfile`
- lấy giá trị tương ứng từ file `.env`
- build image và chạy container local

## Rules

- đính kèm thêm các ENV cần thiết nếu có (các ENV cần thiết được liệt kê trong Dockerfile)
- các ENV cần thiết cần thiết lập vào lúc build Dockerfile hoặc khi chạy container

## Expected Output

- website chạy được trên port localhost:3001
- có thể truy cập và test các tính năng của project trên local