FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_PUBLIC_API_URL=https://dso-group5-etnr.onrender.com
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]