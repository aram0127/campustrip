package com.example.app.domain;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserRateId implements Serializable {
    private Integer raterId;
    private Integer targetId;

    public UserRateId() {}

    public UserRateId(Integer raterId, Integer targetId) {
        this.raterId = raterId;
        this.targetId = targetId;
    }

    public Integer getRaterId() { return raterId; }
    public void setRaterId(Integer raterId) { this.raterId = raterId; }

    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRateId that = (UserRateId) o;
        return Objects.equals(raterId, that.raterId) && Objects.equals(targetId, that.targetId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(raterId, targetId);
    }
}

