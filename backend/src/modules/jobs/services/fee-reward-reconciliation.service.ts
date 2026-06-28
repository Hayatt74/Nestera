import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Transaction } from '../../transactions/entities/transaction.entity';
// import { RewardProfile } from '../../rewards/entities/reward-profile.entity';

@Injectable()
export class FeeRewardReconciliationService {
  private readonly logger = new Logger(FeeRewardReconciliationService.name);

  constructor(
    // @InjectRepository(Transaction)
    // private readonly transactionRepository: Repository<Transaction>,
    // @InjectRepository(RewardProfile)
    // private readonly rewardProfileRepository: Repository<RewardProfile>,
  ) {}

  /**
   * Main reconciliation routine.
   * Compares on-chain computed fees/rewards with system recorded values.
   */
  async performReconciliation(): Promise<ReconciliationResult> {
    this.logger.log('Starting fee/reward reconciliation...');

    // Placeholder: replace with actual queries to fetch expected vs actual data
    const expectedFees = 1000; // await this.computeExpectedFees();
    const actualFees = 1000;   // await this.fetchActualFees();
    const expectedRewards = 500; // await this.computeExpectedRewards();
    const actualRewards = 500;   // await this.fetchActualRewards();

    const differences: FeeRewardDifference[] = [];

    this.compareAndRecord(
      'fees',
      expectedFees,
      actualFees,
      differences,
    );
    this.compareAndRecord(
      'rewards',
      expectedRewards,
      actualRewards,
      differences,
    );

    const result: ReconciliationResult = {
      timestamp: new Date(),
      totalDifferences: differences.length,
      differences,
      automaticallyCorrected: 0,
      adminTicketsCreated: 0,
    };

    if (differences.length > 0) {
      this.logger.warn(`Found ${differences.length} discrepancies`);
      result.automaticallyCorrected = await this.autoCorrect(differences);
      result.adminTicketsCreated = await this.createAdminTickets(differences);
    } else {
      this.logger.log('No discrepancies found.');
    }

    return result;
  }

  private compareAndRecord(
    type: string,
    expected: number,
    actual: number,
    differences: FeeRewardDifference[],
  ): void {
    const diff = expected - actual;
    if (Math.abs(diff) > 0.001) {
      differences.push({
        type,
        expected,
        actual,
        difference: diff,
        severity: Math.abs(diff) > 10 ? 'high' : 'low',
      });
    }
  }

  /**
   * Automatically correct small discrepancies within safe bounds.
   * e.g., differences less than $1 or 0.1% of expected.
   */
  private async autoCorrect(
    differences: FeeRewardDifference[],
  ): Promise<number> {
    let corrected = 0;
    for (const diff of differences) {
      const threshold = Math.max(1, diff.expected * 0.001);
      if (Math.abs(diff.difference) <= threshold && diff.severity !== 'high') {
        // TODO: Execute correction (e.g., adjust ledger entry, refund, etc.)
        this.logger.log(`Auto-correcting ${diff.type} by ${diff.difference}`);
        corrected++;
      }
    }
    return corrected;
  }

  /**
   * Creates admin tickets (or sends notifications) for unresolved differences.
   */
  private async createAdminTickets(
    differences: FeeRewardDifference[],
  ): Promise<number> {
    let tickets = 0;
    for (const diff of differences) {
      if (diff.severity === 'high' || Math.abs(diff.difference) > 10) {
        // TODO: Create a notification or admin ticket entity
        this.logger.warn(
          `Admin ticket needed for ${diff.type}: expected ${diff.expected}, actual ${diff.actual}, diff ${diff.difference}`,
        );
        tickets++;
      }
    }
    return tickets;
  }
}

export interface FeeRewardDifference {
  type: string;
  expected: number;
  actual: number;
  difference: number;
  severity: 'low' | 'high';
}

export interface ReconciliationResult {
  timestamp: Date;
  totalDifferences: number;
  differences: FeeRewardDifference[];
  automaticallyCorrected: number;
  adminTicketsCreated: number;
}
