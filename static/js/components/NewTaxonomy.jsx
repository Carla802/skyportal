import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line import/no-unresolved
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import dataUriToBuffer from "data-uri-to-buffer";
import { showNotification } from "baselayer/components/Notifications";
import { submitTaxonomy, fetchTaxonomies } from "../ducks/taxonomies";

import GroupShareSelect from "./GroupShareSelect";

const NewTaxonomy = () => {
  const { taxonomyList } = useSelector((state) => state.taxonomies);
  const dispatch = useDispatch();

  const groups = useSelector((state) => state.groups.userAccessible);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const handleSubmit = async ({ formData }) => {
    formData.group_ids = selectedGroupIds;
    formData.hierarchy_file = dataUriToBuffer(
      formData.hierarchy_file
    ).toString();
    const result = await dispatch(submitTaxonomy(formData));
    if (result.status === "success") {
      dispatch(showNotification("Taxonomy saved"));
      dispatch(fetchTaxonomies());
    }
  };

  function validate(formData, errors) {
    taxonomyList.forEach((taxonomy) => {
      if (formData.name === taxonomy.name) {
        errors.name.addError("Taxonomy name matches another, please change.");
      }
    });
    return errors;
  }

  const taxonomyFormSchema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "Name",
        description:
          "Short string to make this taxonomy memorable to end users.",
      },
      version: {
        type: "string",
        title: "Version",
        description: "Semantic version of this taxonomy",
      },
      provenance: {
        type: "string",
        title: "Provenance",
        description:
          "Identifier (e.g., URL or git hash) that uniquely ties this taxonomy back to an origin or place of record.",
      },
      hierarchy_file: {
        type: "string",
        format: "data-url",
        title: "Taxonomy file",
        description: "Taxonomy file",
      },
      isLatest: {
        type: "boolean",
        title:
          "Consider this the latest version of the taxonomy with this name?",
      },
    },
    required: ["name", "version", "provenance"],
  };

  return (
    <div>
      <Form
        schema={taxonomyFormSchema}
        validator={validator}
        onSubmit={handleSubmit}
        // eslint-disable-next-line react/jsx-no-bind
        customValidate={validate}
        liveValidate
      />
      <GroupShareSelect
        groupList={groups}
        setGroupIDs={setSelectedGroupIds}
        groupIDs={selectedGroupIds}
      />
    </div>
  );
};

export default NewTaxonomy;
