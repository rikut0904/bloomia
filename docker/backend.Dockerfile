# docker/backend.Dockerfile

FROM rust:1.87.0-bullseye

WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN cargo fetch
RUN cargo build --release

CMD ["cargo", "run", "--release"]

