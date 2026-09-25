package com.causalops.api.entity;
import jakarta.persistence.*; import java.util.*;
@Entity @Table(name="services") public class ServiceEntity { @Id public UUID id; @Column(unique=true) public String name; public String type,status; @Column(name="baseline_latency") public double baselineLatency; @Column(name="current_latency") public double currentLatency; @Column(name="error_rate") public double errorRate; }
