FROM node:alpine as frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM golang:alpine

ENV GIN_MODE=release
ENV PORT=9999

WORKDIR /go/src/image

COPY . /go/src/image
COPY --from=frontend-builder /app/frontend/dist /go/src/image/frontend/build

RUN go build -o ./app cmd/main.go

RUN apk update && apk add --no-cache ffmpeg

EXPOSE $PORT

ENTRYPOINT ["./app"]