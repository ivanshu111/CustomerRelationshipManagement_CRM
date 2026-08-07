package com.sunbeam.CRM.dto.ai;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AIRequest {

    private String name;

    private List<String> answers;

}
