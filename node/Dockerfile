FROM node AS build
RUN mkdir /workspace
WORKDIR /workspace
COPY . /workspace
RUN npm install
RUN npm test

# Python is not included in alpine, 
# which is needed to build bcrypt

FROM node:current-alpine
COPY --from=build /workspace /workspace
WORKDIR /workspace
ENTRYPOINT ["node"]
CMD ["index.js"]
