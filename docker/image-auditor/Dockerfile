FROM node:16.13

# When we build the image, we copy the executable jar in the image file system. 
COPY src /opt/app/

ENTRYPOINT ["node", "/opt/app/auditor.js"]