import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

interface AddressAttributes {
    value: string;
    nickname?: string;
    creatorId: string;
}

@Entity()
export class Address extends BaseEntity implements AddressAttributes  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    value: string;

    @Column({ nullable: true })
    nickname?: string;

    @Column({ nullable: false })
    creatorId: string;

    constructor(attributes?: AddressAttributes) {
        super();
        if (attributes) {
            this.value = attributes.value;
            this.creatorId = attributes.creatorId;
            this.nickname = attributes.nickname;
        }
    }

}
