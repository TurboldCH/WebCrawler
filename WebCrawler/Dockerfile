# Use Bun for better performance
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

COPY package.json ./

# Install dependencies
RUN bun install

# Copy the source files
COPY src ./src


# Start the application
CMD ["bun", "src/crawlLinks.ts"]
