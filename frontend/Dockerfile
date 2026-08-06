FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_LIVEKIT_URL=
ENV VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL
RUN npm run build

RUN npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]