import { PatientInfosRequest } from '@covid/core/user/dto/UserAPIContracts';

import { MentalHealthInfosRequest } from './MentalHealthInfosRequest';
import { TMentalHealthResponse } from './MentalHealthResponse';
import { MentalHealthApiClient } from './MentalHealthApiClient';
import { IMentalHealthState } from '@covid/core/state/mental-health/state/types';

export interface IMentalHealthService {
  initMentalHealth(patientId: string): void;
  saveMentalHealth(assessment: Partial<MentalHealthInfosRequest>): void;
  completeMentalHealth(
    assessment: Partial<MentalHealthInfosRequest> | null,
    patientInfo: PatientInfosRequest
  ): Promise<boolean>;
}

export default class MentalHealthService implements IMentalHealthService {
  mentalHealthApiClient: MentalHealthApiClient;
  state: IMentalHealthState;

  constructor(apiClient: MentalHealthApiClient, state: IMentalHealthState) {
    this.mentalHealthApiClient = apiClient;
    this.state = state;
  }

  private async saveToApi(mentalHealth: Partial<MentalHealthInfosRequest>): Promise<TMentalHealthResponse> {
    let response;
    if (mentalHealth.id) {
      response = await this.mentalHealthApiClient.update(mentalHealth.id, mentalHealth as MentalHealthInfosRequest);
    } else {
      response = await this.mentalHealthApiClient.add(mentalHealth as MentalHealthInfosRequest);
    }
    return response;
  }

  private async sendFullAssessmentToApi() {
    
    // TODO
    
    // try {
    //   const mentalHealth = this.state.getAssessment();
    //   const response = await this.saveToApi(mentalHealth);
    //   if (response.id) {
    //     this.state.updateAssessment({ id: response.id });
    //   }
    //   return response;
    // } catch (error) {
    //   throw error;
    // }
  }

  private saveToState(assessment: Partial<MentalHealthInfosRequest>) {
    // return this.state.updateAssessment(assessment);
  }

  initMentalHealth(patientId: string) {
    const assessment = {
      patient: patientId,
    } as Partial<MentalHealthInfosRequest>;

    // this.state.initMentalHealth(assessment);
  }

  saveMentalHealth(assessment: Partial<MentalHealthInfosRequest>) {
    this.saveToState(assessment);
  }

  async completeMentalHealth(
    assessment: Partial<MentalHealthInfosRequest>,
    patientInfo: PatientInfosRequest
  ): Promise<boolean> {
    if (assessment) {
      if (patientInfo.current_country_code) {
        assessment.current_country_code = patientInfo.current_country_code;
      } else {
        if (patientInfo.current_postcode) {
          assessment.current_postcode = patientInfo.current_postcode;
        } else {
          assessment.current_postcode = patientInfo.postcode;
        }
      }

      this.saveMentalHealth(assessment);
    }

    const response = this.sendFullAssessmentToApi();
    return !!response;
  }
}
