FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NEXT_PUBLIC_APP_URL = https://krishak-frontend-1015721062389.asia-south1.run.app

RUN npm run build

RUN npm ci --omit=dev

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
