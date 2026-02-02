import * as Blockly from 'blockly';

export const getWorkspaceXml = (workspace: Blockly.WorkspaceSvg): string => {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToText(xml);
};
