import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { Component } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import { dietStudyPlaybackReadyUK, notificationReminders } from '@assets';
import { colors } from '@theme';
import { AppRating, shouldAskForRating } from '@covid/components/AppRating';
import { ExternalCallout } from '@covid/components/ExternalCallout';
import InviteToStudy from '@covid/components/InviteToStudy';
import { Header } from '@covid/components/Screen';
import { ShareAppCard } from '@covid/components/Cards/ShareApp';
import { BrandedButton, ClickableText, HeaderText, RegularText } from '@covid/components/Text';
import { lazyInject } from '@covid/provider/services';
import { Services } from '@covid/provider/services.types';
import i18n from '@covid/locale/i18n';
import PushNotificationService, { IPushTokenEnvironment } from '@covid/core/push-notifications/PushNotificationService';
import ExpoPushTokenEnvironment from '@covid/core/push-notifications/expo';
import { ScreenParamList } from '@covid/features/ScreenParamList';
import { IConsentService } from '@covid/core/consent/ConsentService';
import assessmentCoordinator from '@covid/core/assessment/AssessmentCoordinator';
import { BigGreenTickFilled } from '@covid/components/BigGreenTick';
import { FeaturedContentList, FeaturedContentType } from '@covid/components';
import { experiments, startExperiment } from '@covid/core/Experiments';
import Analytics, { events } from '@covid/core/Analytics';
import appCoordinator from '@covid/features/AppCoordinator';
import store from '@covid/core/state/store';

type RenderProps = {
  navigation: StackNavigationProp<ScreenParamList, 'ThankYouUK'>;
  route: RouteProp<ScreenParamList, 'ThankYouUK'>;
};

type State = {
  askForRating: boolean;
  inviteToStudy: boolean;
  shouldShowReminders: boolean;
  showDietStudyPlayback: boolean;
};

const initialState = {
  askForRating: false,
  inviteToStudy: false,
  shouldShowReminders: false,
  showDietStudyPlayback: false,
};

export default class ThankYouUKScreen extends Component<RenderProps, State> {
  @lazyInject(Services.Consent)
  private consentService: IConsentService;
  private pushService: IPushTokenEnvironment = new ExpoPushTokenEnvironment();

  state = initialState;

  async componentDidMount() {
    const { startupInfo } = store.getState().content;
    const variant = startExperiment(experiments.UK_DietScore_Invite, 2);
    const showDietStudyPlayback =
      (variant === 'variant_2' &&
        startupInfo?.show_diet_score &&
        !appCoordinator.patientData.patientState.isReportedByAnother) ||
      false;

    if (showDietStudyPlayback) {
      Analytics.track(events.DIET_STUDY_PLAYBACK_DISPLAYED);
    }

    this.setState({
      askForRating: await shouldAskForRating(),
      inviteToStudy: await this.consentService.shouldAskForValidationStudy(true),
      shouldShowReminders: !(await this.pushService.isGranted()),
      showDietStudyPlayback,
    });
  }

  render() {
    return (
      <>
        {this.state.askForRating && <AppRating />}
        <SafeAreaView>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.rootContainer}>
              <View style={{ marginTop: 24 }}>
                <BigGreenTickFilled />
              </View>

              <Header>
                <HeaderText style={styles.headerText}>{i18n.t('thank-you-uk.title')}</HeaderText>
              </Header>

              <RegularText style={styles.signOff}>{i18n.t('thank-you-uk.sign-off')}</RegularText>

              {this.state.showDietStudyPlayback && (
                <TouchableWithoutFeedback
                  onPress={() => {
                    Analytics.track(events.DIET_STUDY_PLAYBACK_CLICKED);
                    appCoordinator.goToDietStudyPlayback();
                  }}>
                  <Image style={styles.dietStudyImage} source={dietStudyPlaybackReadyUK} />
                </TouchableWithoutFeedback>
              )}

              <FeaturedContentList type={FeaturedContentType.ThankYou} screenName={this.props.route.name} />

              {this.state.shouldShowReminders && (
                <ExternalCallout
                  calloutID="notificationReminders"
                  imageSource={notificationReminders}
                  aspectRatio={1244.0 / 368.0}
                  screenName={this.props.route.name}
                  postClicked={() => {
                    PushNotificationService.openSettings();
                  }}
                />
              )}

              <View style={{ margin: 10 }} />

              <ShareAppCard />

              {this.state.inviteToStudy && <InviteToStudy placement="ThankYouUK" />}

              <BrandedButton
                onPress={() => assessmentCoordinator.gotoNextScreen(this.props.route.name)}
                style={styles.ctaSingleProfile}>
                <RegularText style={styles.ctaSingleProfileText}>
                  {i18n.t('thank-you-uk.cta-single-profile')}
                </RegularText>
              </BrandedButton>

              <View style={styles.ctaMultipleProfile}>
                <ClickableText
                  onPress={() => assessmentCoordinator.gotoSelectProfile()}
                  style={styles.ctaMultipleProfileText}>
                  {i18n.t('thank-you-uk.cta-multi-profile')}
                </ClickableText>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    textAlign: 'center',
  },
  subTitle: {
    textAlign: 'center',
    marginBottom: 15,
  },
  signOff: {
    textAlign: 'center',
    marginHorizontal: 18,
  },
  dateLabel: {
    textAlign: 'center',
    marginTop: -16,
    marginBottom: 8,
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  rootContainer: {
    maxWidth: 500,
    padding: 18,
  },
  socialIconContainer: {
    marginVertical: -10,
    borderRadius: 10,
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  socialIcon: {
    resizeMode: 'contain',
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  ctaMultipleProfile: {
    paddingTop: 15,
    paddingBottom: 24,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaMultipleProfileText: {
    color: colors.purple,
  },
  ctaSingleProfileText: {
    color: colors.brand,
  },
  ctaSingleProfile: {
    marginVertical: 20,
    paddingTop: 8,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.brand,
    borderWidth: 1,
  },
  dietStudyImage: {
    width: '100%',
    aspectRatio: 1200 / 1266,
    height: undefined,
    resizeMode: 'contain',
    marginVertical: 8,
  },
});
