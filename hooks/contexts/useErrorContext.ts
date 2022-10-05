import { DefaultError, PanelError } from "contexts";
import { useContext } from "react";

export const useErrorContext = (type?:string) => {
  switch(type){
    case 'panel':{
     return useContext(PanelError.Context);
    }
    default:{
     return useContext(DefaultError.Context);
    }
  }
}
