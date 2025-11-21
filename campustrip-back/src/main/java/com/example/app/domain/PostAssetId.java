package com.example.app.domain;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PostAssetId  implements Serializable {
    private Integer assetId;
    private Integer postId;
}
