# Create image based on the official Node image from dockerhub
FROM node:14.20 as cache-image

# Bundle app source
COPY . /usr/src/app/

WORKDIR /usr/src/app
RUN npm install

# Build frontend
FROM cache-image as builder
WORKDIR /usr/src/app
COPY . /usr/src/app

#read REACT_APP_THEME_NAME from system environment
#replace "public" folder based on Theme name from REACT_APP_THEME_NAME system environment
ARG REACT_APP_THEME_NAME=${REACT_APP_THEME_NAME}
ENV REACT_APP_THEME_NAME=${REACT_APP_THEME_NAME}
COPY ./public/${REACT_APP_THEME_NAME}/* /usr/src/app/public/

#replace new build version
RUN sed -i "s/REACT_APP_BUILD_VERSION=/REACT_APP_BUILD_VERSION=$(date +%Y%m%d%H%M)/g" .env

#read REACT_APP_API_URL from build arguments of Docker
ARG REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

ARG REACT_APP_BHTNDS=${REACT_APP_BHTNDS}
ENV REACT_APP_BHTNDS=${REACT_APP_BHTNDS}

ARG REACT_APP_RUNTIME_MODE=${REACT_APP_RUNTIME_MODE}
ENV REACT_APP_RUNTIME_MODE=${REACT_APP_RUNTIME_MODE}

ARG REACT_APP_KEY_PAYLOAD=${REACT_APP_KEY_PAYLOAD}
ENV REACT_APP_KEY_PAYLOAD=${REACT_APP_KEY_PAYLOAD}

ARG REACT_APP_ENCRYPT_SECRET_KEY=${REACT_APP_ENCRYPT_SECRET_KEY}
ENV REACT_APP_ENCRYPT_SECRET_KEY=${REACT_APP_ENCRYPT_SECRET_KEY}

ARG REACT_APP_DEPLOY_URL=${REACT_APP_DEPLOY_URL}
ENV REACT_APP_DEPLOY_URL=${REACT_APP_DEPLOY_URL}

ARG REACT_APP_BOOKING_API_KEY=${REACT_APP_BOOKING_API_KEY}
ENV REACT_APP_BOOKING_API_KEY=${REACT_APP_BOOKING_API_KEY}

ARG REACT_APP_PHATNGUOI_WEB_URL=${REACT_APP_PHATNGUOI_WEB_URL}
ENV REACT_APP_PHATNGUOI_WEB_URL=${REACT_APP_PHATNGUOI_WEB_URL}

ARG REACT_APP_INSURANCE_WEB_URL=${REACT_APP_INSURANCE_WEB_URL}
ENV REACT_APP_INSURANCE_WEB_URL=${REACT_APP_INSURANCE_WEB_URL}

ARG REACT_APP_HOME_MINIAPP_HEADER_TITLE=${REACT_APP_HOME_MINIAPP_HEADER_TITLE}
ENV REACT_APP_HOME_MINIAPP_HEADER_TITLE=${REACT_APP_HOME_MINIAPP_HEADER_TITLE}

ARG REACT_APP_HOME_MINIAPP_HEADER_EXPAND=${REACT_APP_HOME_MINIAPP_HEADER_EXPAND}
ENV REACT_APP_HOME_MINIAPP_HEADER_EXPAND=${REACT_APP_HOME_MINIAPP_HEADER_EXPAND}

ARG REACT_APP_TELEGRAM_CHAT_ID=${REACT_APP_TELEGRAM_CHAT_ID}
ENV REACT_APP_TELEGRAM_CHAT_ID=${REACT_APP_TELEGRAM_CHAT_ID}

ARG REACT_APP_TELEGRAM_BOT_TOKEN=${REACT_APP_TELEGRAM_BOT_TOKEN}
ENV REACT_APP_TELEGRAM_BOT_TOKEN=${REACT_APP_TELEGRAM_BOT_TOKEN}

#run command to build and notify
RUN npm run autobuild

# deploy to zalo mini app
# RUN npm deploy-zalo-app

# PROD environment
# Create image based on the official NGINX image from dockerhub
FROM nginx:1.16.0-alpine as deploy-image

## Set timezones
RUN cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime

# Get all the builded code to root folder
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Copy nginx template to container
COPY --from=builder /usr/src/app/ops/config/nginx.template.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/ops/config/default.template.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/start-container.sh /etc/nginx/start-container.sh
COPY --from=builder /usr/src/app/entrypoint.sh /etc/nginx/entrypoint.sh

RUN chmod +x /etc/nginx/start-container.sh
RUN chmod +x /etc/nginx/entrypoint.sh
RUN mkdir -p /usr/share/nginx/html/media

ENTRYPOINT ["/etc/nginx/entrypoint.sh"]

## Serve the app
CMD [ "/bin/sh", "-c", "/etc/nginx/start-container.sh" ]
