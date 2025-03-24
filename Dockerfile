FROM node:23-buster
RUN mkdir /app
COPY package.json /app/
WORKDIR /app
COPY . ./

ENV NEXT_PUBLIC_APP_URL = https://krishak-frontend-1015721062389.asia-south1.run.app

RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run","start"]