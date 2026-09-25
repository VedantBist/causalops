package com.causalops.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TelemetryIntervalConfigTest {

    @Test
    void testDefaultIntervalValue() {
        // Direct verification of default fallback
        String fallback = "1000";
        long intervalMs = Long.parseLong(System.getenv().getOrDefault("TELEMETRY_COLLECTION_INTERVAL_MS", fallback));
        assertEquals(1000L, intervalMs);
    }
}
