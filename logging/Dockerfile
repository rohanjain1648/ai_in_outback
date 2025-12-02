# Fluentd Dockerfile for log aggregation

FROM fluent/fluentd:v1.16-debian-1

# Use root account to use apk
USER root

# Install plugins
RUN buildDeps="sudo make gcc g++ libc-dev" \
    && apt-get update \
    && apt-get install -y --no-install-recommends $buildDeps \
    && sudo gem install fluent-plugin-elasticsearch \
    && sudo gem sources --clear-all \
    && SUDO_FORCE_REMOVE=yes \
    apt-get purge -y --auto-remove \
                  -o APT::AutoRemove::RecommendsImportant=false \
                  $buildDeps \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem

# Copy configuration
COPY fluent.conf /fluentd/etc/
COPY entrypoint.sh /bin/

# Create log directory
RUN mkdir -p /fluentd/log

# Switch back to fluent user
USER fluent

# Expose port
EXPOSE 24224

# Start Fluentd
CMD ["fluentd", "-c", "/fluentd/etc/fluent.conf", "-v"]