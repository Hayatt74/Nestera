import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { FeeRewardReconciliationService } from '../services/fee-reward-reconciliation.service';

@Processor('reconciliation')
export class ReconciliationProcessor {
  private readonly logger = new Logger(ReconciliationProcessor.name);

  constructor(
    private readonly reconciliationService: FeeRewardReconciliationService,
  ) {}

  /**
   * Process the reconciliation job.
   * This job can be triggered on a schedule (e.g., via cron or external scheduler).
   */
  @Process('reconcile')
  async handleReconciliation(job: Job) {
    this.logger.log(`Processing reconciliation job ${job.id}`);
    try {
      const result = await this.reconciliationService.performReconciliation();
      this.logger.log(
        `Reconciliation completed: ${result.totalDifferences} discrepancies found, ${result.automaticallyCorrected} auto-corrected, ${result.adminTicketsCreated} admin tickets created.`,
      );
      return result;
    } catch (error) {
      this.logger.error('Reconciliation job failed', error);
      throw error;
    }
  }
}
