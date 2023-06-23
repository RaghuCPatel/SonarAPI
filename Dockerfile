FROM node:14
LABEL Name=platforn Version=1.0
ENV PATH=/app/bin:$PATH

RUN apt-get update -qq && apt-get install -y nodejs libxml2
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Install Node.js with npm
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt -y install nodejs
RUN apt -y install gcc g++ make cmake

# Install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install yarn

COPY . .
# Install node modules
ADD package.json ./
RUN npm install
RUN npm run build
EXPOSE 3000
CMD [ "node", "dist/index.js"]
