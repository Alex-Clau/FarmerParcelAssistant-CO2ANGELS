FROM node:20-alpine
WORKDIR /frontend
COPY package*.json .
RUN npm i
CMD sh -c "npm run dev -- --host --port ${FRONTEND_PORT:-5173}"

