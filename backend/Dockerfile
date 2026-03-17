FROM node:24-alpine
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile
COPY . .
RUN mkdir -p /app/config
ENV CONFIG_PATH=/app/config/backend.json
EXPOSE 8080
CMD ["yarn", "dev"]