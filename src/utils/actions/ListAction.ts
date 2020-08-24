import { Action } from "../Action";
import { JsonObject } from "../ComponentManager";
import { ListItemGroup } from "../ListItem";
import { actionsFromJson } from "../ActionManager";

export class ListAction extends Action implements ListItemGroup {
  public static id = "List";
  public static icon = "receipt_long";
  public id = ListAction.id;
  public icon = ListAction.icon;
  public expaned = true;

  constructor(public actions: Action[]) {
    super();
  }

  static fromJson(jsonObj: JsonObject) {
    return new ListAction(actionsFromJson(jsonObj.actions));
  }

  toDataObj() {
    return {
      actions: this.actions.map(action => action.toJsonObj())
    };
  }

  getItems() {
    return this.actions;
  }

  isGroup() {
    return true;
  }
}
